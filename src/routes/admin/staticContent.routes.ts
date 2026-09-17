import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { resolveLocale, getRequestedLocale, pickTranslation } from '../../utils/translation';

// Prisma Client hali generatsiya qilinmagan muhitda ham implicit-any xatolarisiz
// kompilyatsiya bo'lishi uchun minimal mahalliy tip.
interface StaticContentRow {
  key: string;
  locale: string;
  data: unknown;
  updatedAt: Date;
}

const router = Router();
router.use(authGuard, requirePermission({ read: 'content:view', write: 'content:manage' }));

// GET /api/admin/static-content — barcha statik sahifalar ro'yxati (standart til bo'yicha, key+updatedAt)
// E'tibor: `lang` yuborilmasa standart tilga tushadi — eski admin panel so'rovlari o'zgarishsiz ishlayveradi.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { locale } = await resolveLocale(getRequestedLocale(req.query));

    const items: StaticContentRow[] = await prisma.staticContentTranslation.findMany({
      where: { locale },
      orderBy: { key: 'asc' },
    });

    res.json({ items });
  })
);

// GET /api/admin/static-content/:key?lang=ru  (masalan "about:hamkorlik")
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));

    const rows: StaticContentRow[] = await prisma.staticContentTranslation.findMany({ where: { key: req.params.key } });
    const record = pickTranslation<StaticContentRow>(rows, locale, defaultLocale);

    if (!record) throw new NotFoundError('Kontent topilmadi');
    res.json(record);
  })
);

const updateSchema = z.object({ data: z.record(z.string(), z.any()) });

// PUT /api/admin/static-content/:key?lang=ru — mavjud bo'lmasa yaratadi (upsert).
// `lang` yuborilmasa standart tilga yoziladi — eski admin panel so'rovlari o'zgarishsiz ishlayveradi.
router.put(
  '/:key',
  asyncHandler(async (req, res) => {
    const { data } = updateSchema.parse(req.body);
    const { locale } = await resolveLocale(getRequestedLocale(req.query));

    const record = await prisma.staticContentTranslation.upsert({
      where: { key_locale: { key: req.params.key, locale } },
      create: { key: req.params.key, locale, data },
      update: { data },
    });

    res.json(record);
  })
);

export default router;
