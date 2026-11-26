import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { serializeFaqAdmin } from '../../utils/serializers';
import { validateTranslationsInput } from '../../utils/translation';

/**
 * TTBS (tez-tez beriladigan savollar) boshqaruvi.
 *
 * Naqsh `categories.routes.ts` bilan bir xil: bazaviy yozuvda tilga bog'liq matn yo'q,
 * savol/javob `FaqItemTranslation` da; `validateTranslationsInput` esa standart til
 * majburiyligini, noma'lum/takroriy til kodlarini bir joyda tekshiradi (DRY).
 */
const router = Router();
router.use(authGuard, requirePermission({ read: 'faq:view', write: 'faq:manage' }));

const faqTranslationSchema = z.object({
  locale: z.string().min(2),
  question: z.string().min(3),
  answer: z.string().min(3),
});

const withTranslations = { include: { translations: true } } as const;

// GET /api/admin/faq
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.faqItem.findMany({ orderBy: { order: 'asc' }, ...withTranslations });
    res.json({ items: items.map(serializeFaqAdmin) });
  })
);

// GET /api/admin/faq/:id — barcha tillardagi tarjimalar bilan (tahrirlash formasi uchun)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.faqItem.findUnique({ where: { id: req.params.id }, ...withTranslations });
    if (!item) throw new NotFoundError('Savol topilmadi');
    res.json(serializeFaqAdmin(item));
  })
);

const createSchema = z.object({
  translations: z.array(faqTranslationSchema),
});

// POST /api/admin/faq
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    await validateTranslationsInput(data.translations);

    // Yangi savol ro'yxat oxiriga qo'shiladi
    const maxOrder = await prisma.faqItem.aggregate({ _max: { order: true } });

    const item = await prisma.faqItem.create({
      data: {
        order: (maxOrder._max.order ?? -1) + 1,
        translations: { create: data.translations },
      },
      ...withTranslations,
    });

    res.status(201).json(serializeFaqAdmin(item));
  })
);

const updateSchema = z.object({
  translations: z.array(faqTranslationSchema).optional(),
  order: z.number().int().optional(),
});

// PUT /api/admin/faq/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.faqItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Savol topilmadi');

    if (data.translations) {
      await validateTranslationsInput(data.translations);

      for (const t of data.translations) {
        await prisma.faqItemTranslation.upsert({
          where: { faqId_locale: { faqId: req.params.id, locale: t.locale } },
          create: { faqId: req.params.id, locale: t.locale, question: t.question, answer: t.answer },
          update: { question: t.question, answer: t.answer },
        });
      }

      // Formada bo'shatib yuborilgan tillar tarjimasi o'chiriladi — aks holda eski
      // matn bazada qolib, saytda ko'rinishda davom etardi.
      const keptLocales = data.translations.map((t) => t.locale);
      await prisma.faqItemTranslation.deleteMany({
        where: { faqId: req.params.id, locale: { notIn: keptLocales } },
      });
    }

    const item = await prisma.faqItem.update({
      where: { id: req.params.id },
      data: { order: data.order },
      ...withTranslations,
    });

    res.json(serializeFaqAdmin(item));
  })
);

// DELETE /api/admin/faq/:id — tarjimalar `onDelete: Cascade` bilan o'zi o'chadi
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.faqItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Savol topilmadi');

    await prisma.faqItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
