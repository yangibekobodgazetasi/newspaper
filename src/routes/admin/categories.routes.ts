import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { ApiError, NotFoundError } from '../../middleware/errorHandler';
import { generateUniqueCategorySlug } from '../../utils/slug';
import { serializeCategoryAdmin } from '../../utils/serializers';
import { validateTranslationsInput } from '../../utils/translation';

const router = Router();
router.use(authGuard, requirePermission({ read: 'categories:view', write: 'categories:manage' }));

const categoryTranslationSchema = z.object({
  locale: z.string().min(2),
  label: z.string().min(2),
  description: z.string().min(2),
});

const categoryWithTranslations = { include: { translations: true } } as const;

// GET /api/admin/categories
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.newsCategory.findMany({ orderBy: { order: 'asc' }, ...categoryWithTranslations });
    res.json({ items: items.map(serializeCategoryAdmin) });
  })
);

// GET /api/admin/categories/:slug — barcha tillardagi tarjimalar bilan (tahrirlash formasi uchun)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const category = await prisma.newsCategory.findUnique({ where: { slug: req.params.slug }, ...categoryWithTranslations });
    if (!category) throw new NotFoundError('Toifa topilmadi');
    res.json(serializeCategoryAdmin(category));
  })
);

const createSchema = z.object({
  translations: z.array(categoryTranslationSchema),
});

// POST /api/admin/categories — yangi (tizimga tegishli bo'lmagan) toifa qo'shish.
// Slug standart til nomidan avtomatik yasaladi (News'dagidek — admin qo'lda kiritmaydi).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const { defaultLocale } = await validateTranslationsInput(data.translations);

    const defaultTranslation = data.translations.find((t) => t.locale === defaultLocale)!;
    const slug = await generateUniqueCategorySlug(defaultTranslation.label);

    const maxOrder = await prisma.newsCategory.aggregate({ _max: { order: true } });

    const category = await prisma.newsCategory.create({
      data: {
        slug,
        isSystem: false,
        order: (maxOrder._max.order ?? 0) + 1,
        translations: { create: data.translations },
      },
      ...categoryWithTranslations,
    });

    res.status(201).json(serializeCategoryAdmin(category));
  })
);

const updateSchema = z.object({
  translations: z.array(categoryTranslationSchema).optional(),
  order: z.number().int().optional(),
});

// PUT /api/admin/categories/:slug — faqat tarjimalar/tartib o'zgaradi, slug barqaror qoladi
router.put(
  '/:slug',
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.newsCategory.findUnique({ where: { slug: req.params.slug } });
    if (!existing) throw new NotFoundError('Toifa topilmadi');

    if (data.translations) {
      await validateTranslationsInput(data.translations);

      for (const t of data.translations) {
        await prisma.newsCategoryTranslation.upsert({
          where: { categorySlug_locale: { categorySlug: req.params.slug, locale: t.locale } },
          create: { categorySlug: req.params.slug, locale: t.locale, label: t.label, description: t.description },
          update: { label: t.label, description: t.description },
        });
      }
    }

    const category = await prisma.newsCategory.update({
      where: { slug: req.params.slug },
      data: { order: data.order },
      ...categoryWithTranslations,
    });

    res.json(serializeCategoryAdmin(category));
  })
);

// DELETE /api/admin/categories/:slug — tizim toifalarini o'chirib bo'lmaydi (routing ularga bog'liq)
router.delete(
  '/:slug',
  asyncHandler(async (req, res) => {
    const existing = await prisma.newsCategory.findUnique({ where: { slug: req.params.slug } });
    if (!existing) throw new NotFoundError('Toifa topilmadi');

    if (existing.isSystem) {
      throw new ApiError(400, "Tizim toifalarini o'chirib bo'lmaydi (sayt tuzilishiga bog'liq)");
    }

    const newsCount = await prisma.news.count({ where: { categorySlug: req.params.slug } });
    if (newsCount > 0) {
      throw new ApiError(400, `Bu toifada ${newsCount} ta yangilik bor — avval ularni boshqa toifaga o'tkazing`);
    }

    await prisma.newsCategory.delete({ where: { slug: req.params.slug } });
    res.json({ success: true });
  })
);

export default router;
