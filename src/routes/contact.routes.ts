import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { resolveLocale, getRequestedLocale } from '../utils/translation';
import { getStaticContentData } from '../utils/staticContent';
import { buildThrottleCreate, throwIfThrottleViolation } from '../utils/submissionThrottle';

const router = Router();

// GET /api/contact/manzil?lang=ru
router.get(
  '/manzil',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    res.json(await getStaticContentData('contact:manzil', locale, defaultLocale));
  })
);

// GET /api/contact/rekvizitlar?lang=ru
router.get(
  '/rekvizitlar',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    res.json(await getStaticContentData('contact:rekvizitlar', locale, defaultLocale));
  })
);

// GET /api/contact/qabul-jadvali?lang=ru
router.get(
  '/qabul-jadvali',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    res.json(await getStaticContentData('contact:qabul-jadvali', locale, defaultLocale));
  })
);

// GET /api/contact/xaridorlar-uchun?lang=ru
router.get(
  '/xaridorlar-uchun',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    res.json(await getStaticContentData('contact:xaridorlar-uchun', locale, defaultLocale));
  })
);

const murojaatSchema = z.object({
  fullName: z.string().min(2, "Ism kamida 2 belgidan iborat bo'lishi kerak"),
  phone: z.string().optional(),
  email: z.string().email("Email noto'g'ri formatda"),
  subject: z.string().min(2),
  message: z.string().min(5, "Xabar juda qisqa"),
  visitorHash: z.string().max(100).optional(),
});

// POST /api/contact/murojaat — tarjima bilan bog'liq emas, o'zgarishsiz qoldi
router.post(
  '/murojaat',
  asyncHandler(async (req, res) => {
    const { visitorHash, ...data } = murojaatSchema.parse(req.body);

    const ticketId = `M-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await prisma.$transaction([
        buildThrottleCreate('MUROJAAT', req, visitorHash),
        prisma.contactMessage.create({ data: { ...data, ticketId } }),
      ]);
    } catch (err) {
      throwIfThrottleViolation('MUROJAAT', err);
    }

    res.status(201).json({ success: true, ticketId });
  })
);

export default router;
