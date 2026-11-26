import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError, ApiError } from '../middleware/errorHandler';
import { parsePagination, toPaginated } from '../utils/pagination';
import { serializeNews, serializeMediaItem, serializeCategory } from '../utils/serializers';
import { resolveLocale, pickTranslation, getRequestedLocale } from '../utils/translation';

// Faqat shu faylga kerak bo'lgan minimal maydonlar — Prisma Client hali generatsiya
// qilinmagan muhitda ham (masalan shu sandbox) implicit-any xatolarisiz kompilyatsiya bo'lishi uchun.
interface CategoryTranslationRow {
  locale: string;
  label: string;
  description: string;
}
interface CategoryRow {
  slug: string;
  isSystem: boolean;
  translations: CategoryTranslationRow[];
}
interface NewsTranslationRow {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
}
interface NewsRow {
  id: string;
  categorySlug: string;
  author: string;
  publishedAt: Date;
  cover: string;
  coverImage: string | null;
  featured: boolean;
  translations: NewsTranslationRow[];
  category: { translations: CategoryTranslationRow[] };
}
interface LocaleSlugRow {
  locale: string;
  slug: string;
}
interface NewsTranslationWithNewsRow extends NewsTranslationRow {
  news: {
    id: string;
    categorySlug: string;
    author: string;
    publishedAt: Date;
    cover: string;
    coverImage: string | null;
    featured: boolean;
  };
}

const router = Router();

// GET /api/news/categories?lang=ru — barcha toifalar (statik + admin qo'shgan yangilari)
// E'tibor: bu ham "/:category" dan OLDIN e'lon qilingan (xuddi media-galereya kabi).
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));

    const categories: CategoryRow[] = await prisma.newsCategory.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true }, // kichik jadval — barcha tarjimalarni olish arzon
    });

    const items = categories
      .map((category: CategoryRow) => {
        const translation = pickTranslation<CategoryTranslationRow>(category.translations, locale, defaultLocale);
        return translation ? serializeCategory(category, translation) : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    res.json({ items });
  })
);

// GET /api/news/media-galereya?page=1&pageSize=24
// (media galereya kontenti hozircha tarjima qilinmaydi — faqat News/Category/Team/StaticContent)
router.get(
  '/media-galereya',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({
        orderBy: { publishedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.mediaItem.count(),
    ]);

    res.json(toPaginated(items.map(serializeMediaItem), total, pagination));
  })
);

async function assertCategoryExists(slug: string) {
  const category = await prisma.newsCategory.findUnique({ where: { slug } });
  if (!category) {
    throw new ApiError(400, `Noma'lum toifa: ${slug}`);
  }
}

// GET /api/news/search?q=...&page=1&pageSize=12&lang=ru
// `/:category` dan OLDIN e'lon qilingan — aks holda "search" toifa nomi sifatida
// qabul qilinib, `assertCategoryExists('search')` 400 xato qaytarardi.
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    const pagination = parsePagination(req);

    // Juda qisqa so'rov (masalan bitta harf) butun jadvalni skanerlaydi va
    // foydasiz natija beradi — frontend ham shu chegarani hurmat qiladi.
    if (q.length < 2) {
      res.json(toPaginated([], 0, pagination));
      return;
    }

    // Sarlavha va qisqacha mazmun bo'yicha qidiriladi — joriy tilda, topilmasa
    // standart tilda ham (boshqa endpointlar bilan bir xil fallback mantig'i).
    const matches: { newsId: string }[] = await prisma.newsTranslation.findMany({
      where: {
        locale: { in: [locale, defaultLocale] },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { newsId: true },
      distinct: ['newsId'],
    });
    const newsIds = matches.map((m) => m.newsId);

    const newsRows: NewsRow[] = await prisma.news.findMany({
      where: { id: { in: newsIds } },
      orderBy: { publishedAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        translations: { where: { locale: { in: [locale, defaultLocale] } } },
        category: { include: { translations: { where: { locale: { in: [locale, defaultLocale] } } } } },
      },
    });

    const items = newsRows
      .map((news: NewsRow) => {
        const translation = pickTranslation<NewsTranslationRow>(news.translations, locale, defaultLocale);
        const categoryLabel =
          pickTranslation<CategoryTranslationRow>(news.category.translations, locale, defaultLocale)?.label ??
          news.categorySlug;
        return translation ? serializeNews(news, translation, categoryLabel) : null;
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);

    res.json(toPaginated(items, newsIds.length, pagination));
  })
);

// GET /api/news/:category?page=1&pageSize=12&lang=ru
router.get(
  '/:category',
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    await assertCategoryExists(category);

    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    const pagination = parsePagination(req);

    const [newsRows, total]: [NewsRow[], number] = await Promise.all([
      prisma.news.findMany({
        where: { categorySlug: category },
        orderBy: { publishedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          translations: { where: { locale: { in: [locale, defaultLocale] } } },
          category: { include: { translations: { where: { locale: { in: [locale, defaultLocale] } } } } },
        },
      }),
      prisma.news.count({ where: { categorySlug: category } }),
    ]);

    const items = newsRows
      .map((news: NewsRow) => {
        const translation = pickTranslation<NewsTranslationRow>(news.translations, locale, defaultLocale);
        const categoryLabel = pickTranslation<CategoryTranslationRow>(news.category.translations, locale, defaultLocale)?.label ?? category;
        return translation ? serializeNews(news, translation, categoryLabel) : null;
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);

    res.json(toPaginated(items, total, pagination));
  })
);

// GET /api/news/:category/:slug?lang=ru
// Slug har til uchun alohida (@@unique([locale, slug])), shuning uchun avval so'ralgan
// tilda qidiramiz; topilmasa standart tildagi shu slug bilan qayta uriniladi (fallback).
router.get(
  '/:category/:slug',
  asyncHandler(async (req, res) => {
    const { category, slug } = req.params;
    await assertCategoryExists(category);

    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));

    let translation: NewsTranslationWithNewsRow | null = await prisma.newsTranslation.findFirst({
      where: { locale, slug, news: { categorySlug: category } },
      include: { news: true },
    });

    if (!translation && locale !== defaultLocale) {
      translation = await prisma.newsTranslation.findFirst({
        where: { locale: defaultLocale, slug, news: { categorySlug: category } },
        include: { news: true },
      });
    }

    if (!translation) {
      throw new NotFoundError('Maqola topilmadi');
    }

    const categoryRow: CategoryRow | null = await prisma.newsCategory.findUnique({
      where: { slug: category },
      include: { translations: { where: { locale: { in: [translation.locale, defaultLocale] } } } },
    });
    const categoryLabel = pickTranslation<CategoryTranslationRow>(categoryRow?.translations ?? [], translation.locale, defaultLocale)?.label ?? category;

    // Shu maqolaning HAR BIR tildagi slug'i. Slug tarjima qilinadi (@@unique([locale, slug])),
    // shuning uchun frontend hreflang/alternate havolalarini faqat shu ma'lumot bilan
    // to'g'ri qura oladi — aks holda boshqa tillar uchun toifa ro'yxatiga tushib qolardi.
    // Bu maydon QO'SHIMCHA — mavjud javob shakli o'zgarmagan.
    const localeSlugs: LocaleSlugRow[] = await prisma.newsTranslation.findMany({
      where: { newsId: translation.news.id },
      select: { locale: true, slug: true },
    });
    const slugs: Record<string, string> = {};
    for (const row of localeSlugs) slugs[row.locale] = row.slug;

    res.json({ ...serializeNews(translation.news, translation, categoryLabel), slugs });
  })
);

export default router;
