import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { ApiError } from '../../middleware/errorHandler';

const router = Router();
router.use(authGuard, requirePermission('dashboard:view'));

type Range = 'daily' | 'weekly' | 'monthly' | 'yearly';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const WEEKDAY_LABELS_UZ = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const MONTH_LABELS_UZ = [
  'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek',
];

interface Bucket {
  label: string;
  start: Date;
  end: Date;
}

function buildBuckets(range: Range, now: Date): Bucket[] {
  const buckets: Bucket[] = [];

  if (range === 'daily') {
    // So'nggi 24 soat, har biri 1 soatlik 24 ta bo'lak
    for (let i = 23; i >= 0; i--) {
      const end = new Date(now.getTime() - i * HOUR_MS);
      const start = new Date(end.getTime() - HOUR_MS);
      buckets.push({ label: `${end.getHours().toString().padStart(2, '0')}:00`, start, end });
    }
  } else if (range === 'weekly') {
    // So'nggi 7 kun, har biri 1 kunlik
    for (let i = 6; i >= 0; i--) {
      const end = new Date(now.getTime() - i * DAY_MS);
      const start = new Date(end.getTime() - DAY_MS);
      buckets.push({ label: WEEKDAY_LABELS_UZ[end.getDay()], start, end });
    }
  } else if (range === 'monthly') {
    // So'nggi 30 kun, har biri 1 kunlik
    for (let i = 29; i >= 0; i--) {
      const end = new Date(now.getTime() - i * DAY_MS);
      const start = new Date(end.getTime() - DAY_MS);
      buckets.push({ label: `${end.getDate()}.${end.getMonth() + 1}`, start, end });
    }
  } else {
    // So'nggi 12 oy, har biri 1 oylik (taqvim oyi bo'yicha)
    for (let i = 11; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: MONTH_LABELS_UZ[start.getMonth()], start, end });
    }
  }

  return buckets;
}

// GET /api/admin/analytics/visits?range=daily|weekly|monthly|yearly
router.get(
  '/visits',
  asyncHandler(async (req, res) => {
    const range = (req.query.range as string) || 'weekly';
    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(range)) {
      throw new ApiError(400, "Noma'lum oraliq. Ruxsat etilgan: daily, weekly, monthly, yearly");
    }

    const now = new Date();
    const buckets = buildBuckets(range as Range, now);
    const earliestStart = buckets[0].start;

    const visits = await prisma.siteVisit.findMany({
      where: { createdAt: { gte: earliestStart } },
      select: { createdAt: true },
    });

    const data = buckets.map((bucket) => ({
      label: bucket.label,
      count: visits.filter((v: { createdAt: Date }) => v.createdAt >= bucket.start && v.createdAt < bucket.end).length,
    }));

    const last24h = await prisma.siteVisit.count({
      where: { createdAt: { gte: new Date(now.getTime() - DAY_MS) } },
    });

    res.json({ range, data, last24h });
  })
);

export default router;
