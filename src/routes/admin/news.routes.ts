import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { ApiError, NotFoundError } from '../../middleware/errorHandler';
import { parsePagination, toPaginated } from '../../utils/pagination';
import { serializeNewsAdmin } from '../../utils/serializers';
import { generateUniqueNewsSlug } from '../../utils/slug';
import { validateTranslationsInput } from '../../utils/translation';
import { assertCanMutate, ownershipFilter } from '../../utils/ownership';
import { hasPermission } from '../../types/permissions';

const router = Router();

// O'qish uchun `news:view`, yozish uchun `news:create` yetarli — LEKIN bu faqat
// birinchi darajali filtr. Muxbirda `news:edit.any` yo'q, shuning uchun quyidagi
// har bir `:id` endpointi qo'shimcha ravishda yozuv EGASINI ham tekshiradi
// (bkl. utils/ownership.ts) — ID almashtirish orqali IDOR qilib bo'lmaydi.
router.use(authGuard, requirePermission({ read: 'news:view', write: 'news:create' }));

// Har bir tarjima uchun — `slug` bu yerda YO'Q: backend uni sarlavhadan avtomatik
// generatsiya qiladi (bkl. utils/slug.ts) va tahrirlashda o'zgartirmaydi.
const newsTranslationSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(3),
  excerpt: z.string().min(3),
  body: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
});

const newsSchema = z.object({
  categorySlug: z.string().min(2),
  author: z.string().min(2),
  publishedAt: z.string(), // "YYYY-MM-DD"
  cover: z.enum(['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4']),
  // `.nullable()` shart: admin rasmni olib tashlaganda frontend `null` yuboradi.
  // Faqat `.optional()` bo'lsa `undefined` kelardi va Prisma uni "o'zgartirma" deb
  // tushunib, eski rasm o'chirilmay qolardi (bkl. team.routes.ts dagi ishlaydigan namuna).
  coverImage: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  translations: z.array(newsTranslationSchema),
});

async function assertCategoryExists(categorySlug: string) {
  const category = await prisma.newsCategory.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    throw new ApiError(400, `Noma'lum toifa: ${categorySlug}`);
  }
}

const newsWithTranslations = { include: { translations: true } } as const;

/**
 * "Bosh material" (featured) yangilik bosh sahifadagi hero karuselida chiqadi —
 * bu tahririy nashr qarori. Muxbir uni o'zi belgilay olmaydi.
 */
function assertCanSetFeatured(req: { user?: { role: string } }, featured: boolean | undefined) {
  if (featured && !hasPermission(req.user?.role, 'news:feature')) {
    throw new ApiError(403, "Yangilikni bosh material sifatida belgilash huquqingiz yo'q");
  }
}

// GET /api/admin/news?page=1&pageSize=20&categorySlug=...
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);
    const categorySlug = req.query.categorySlug as string | undefined;
    // Muxbir faqat O'ZI yaratgan yangiliklarni ko'radi — boshqalarnikini tahrirlay
    // olmasligi sababli ro'yxatda ko'rsatish faqat chalkashlik keltirardi.
    const where = {
      ...(categorySlug ? { categorySlug } : {}),
      ...ownershipFilter(req.user, 'news:edit.any', 'authorId'),
    };

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        ...newsWithTranslations,
      }),
      prisma.news.count({ where }),
    ]);

    res.json(toPaginated(items.map(serializeNewsAdmin), total, pagination));
  })
);

/**
 * GET /api/admin/news/authors — forma "Muallif" ro'yxati uchun jamoa a'zolari
 * + tashqi (jamoadan tashqari) mualliflar bo'yicha taklif ro'yxati.
 *
 * NIMA UCHUN `/admin/team` EMAS: u router `team:view` huquqini talab qiladi,
 * MUXBIR'da esa bu huquq yo'q (bkl. types/permissions.ts) — muxbir yangilik
 * yaratmoqchi bo'lganda ro'yxat 403 bilan bo'sh qolardi. Bu endpoint news
 * router'ining o'z guard'i ostida (o'qish uchun `news:view`) turadi va faqat
 * `id` + `name` qaytaradi, jamoa haqidagi boshqa ma'lumot chiqmaydi.
 *
 * MUHIM: `author` — bu saytda chiqadigan ISM, huquq tekshiruvi uchun
 * ISHLATILMAYDI (u `authorId` orqali ketadi, bkl. utils/ownership.ts). Shuning
 * uchun ro'yxat qulaylik uchun — `author` maydoni ataylab shu ro'yxat bilan
 * cheklanmaydi, aks holda jamoada endi yo'q muallifga tegishli eski
 * yangiliklarni umuman saqlab bo'lmay qolardi.
 *
 * `externalSuggestions` — bazadagi yangiliklarda avval ISHLATILGAN, lekin
 * jamoada bo'lmagan muallif ismlari (masalan xaridor/tashqi muxbir). Forma
 * "Boshqa" rejimida bularni `<datalist>` orqali taklif qiladi — majburlamaydi,
 * faqat bir xil ismning turlicha yozilib qolishini (masalan "Ism FAMILIYA"
 * bugun, "Ism Familiya" ertaga) kamaytirish uchun.
 *
 * `/:id` dan OLDIN turishi shart, aks holda "authors" id sifatida qabul qilinadi.
 */
router.get(
  '/authors',
  asyncHandler(async (_req, res) => {
    const [members, distinctAuthors] = await Promise.all([
      prisma.teamMember.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      }),
      prisma.news.findMany({ distinct: ['author'], select: { author: true } }),
    ]);

    const teamNames = new Set(members.map((m) => m.name));
    const externalSuggestions = distinctAuthors
      .map((n) => n.author)
      .filter((name) => !teamNames.has(name))
      .sort((a, b) => a.localeCompare(b));

    res.json({ items: members, externalSuggestions });
  })
);

// GET /api/admin/news/:id — barcha tillardagi tarjimalar bilan (tahrirlash formasi uchun)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.news.findUnique({ where: { id: req.params.id }, ...newsWithTranslations });
    if (!item) throw new NotFoundError('Yangilik topilmadi');
    assertCanMutate(req.user, 'news:edit.any', item.authorId);
    res.json(serializeNewsAdmin(item));
  })
);

// POST /api/admin/news — translations[] massivi, standart til majburiy
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = newsSchema.parse(req.body);
    await assertCategoryExists(data.categorySlug);
    assertCanSetFeatured(req, data.featured);
    await validateTranslationsInput(data.translations);

    const translationsData = await Promise.all(
      data.translations.map(async (t) => ({
        locale: t.locale,
        slug: await generateUniqueNewsSlug(t.title, t.locale),
        title: t.title,
        excerpt: t.excerpt,
        body: t.body,
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        ogTitle: t.ogTitle,
        ogDescription: t.ogDescription,
      }))
    );

    const news = await prisma.news.create({
      data: {
        categorySlug: data.categorySlug,
        author: data.author,
        // Egalik tokendan olinadi, mijoz yuborgan qiymatdan EMAS — aks holda
        // muxbir o'zini boshqa foydalanuvchi o'rniga qo'ya olardi.
        authorId: req.user?.id,
        publishedAt: new Date(data.publishedAt),
        cover: data.cover,
        coverImage: data.coverImage,
        featured: data.featured ?? false,
        translations: { create: translationsData },
      },
      ...newsWithTranslations,
    });

    res.status(201).json(serializeNewsAdmin(news));
  })
);

const newsUpdateSchema = newsSchema.partial().extend({
  translations: z.array(newsTranslationSchema).optional(),
});

// PUT /api/admin/news/:id — translations[] ixtiyoriy: yuborilgan tillar upsert qilinadi
// (yuborilmagan tillar tegilmaydi — boshqa tab'lardagi tarjimalar yo'qolmaydi).
// Mavjud tarjima uchun slug o'zgarmaydi, yangi til qo'shilsa slug avtomatik yaratiladi.
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = newsUpdateSchema.parse(req.body);
    if (data.categorySlug) await assertCategoryExists(data.categorySlug);

    const existing = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Yangilik topilmadi');
    assertCanMutate(req.user, 'news:edit.any', existing.authorId);
    assertCanSetFeatured(req, data.featured);

    if (data.translations) {
      await validateTranslationsInput(data.translations);

      for (const t of data.translations) {
        const existingTranslation = await prisma.newsTranslation.findUnique({
          where: { newsId_locale: { newsId: req.params.id, locale: t.locale } },
        });
        const slug = existingTranslation ? existingTranslation.slug : await generateUniqueNewsSlug(t.title, t.locale, req.params.id);

        await prisma.newsTranslation.upsert({
          where: { newsId_locale: { newsId: req.params.id, locale: t.locale } },
          create: {
            newsId: req.params.id,
            locale: t.locale,
            slug,
            title: t.title,
            excerpt: t.excerpt,
            body: t.body,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
            ogTitle: t.ogTitle,
            ogDescription: t.ogDescription,
          },
          update: {
            title: t.title,
            excerpt: t.excerpt,
            body: t.body,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
            ogTitle: t.ogTitle,
            ogDescription: t.ogDescription,
          },
        });
      }
    }

    const news = await prisma.news.update({
      where: { id: req.params.id },
      data: {
        categorySlug: data.categorySlug,
        author: data.author,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        cover: data.cover,
        coverImage: data.coverImage,
        featured: data.featured,
      },
      ...newsWithTranslations,
    });

    res.json(serializeNewsAdmin(news));
  })
);

// DELETE /api/admin/news/:id — NewsTranslation'lar `onDelete: Cascade` orqali avtomatik o'chadi
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Yangilik topilmadi');
    assertCanMutate(req.user, 'news:edit.any', existing.authorId);

    await prisma.news.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
