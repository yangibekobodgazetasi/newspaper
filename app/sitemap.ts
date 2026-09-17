import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getSiteUrl, localizedPath } from '@/lib/seo';
import { getCategories, getNewsByCategory } from '@/lib/news';
import { getSortedIssues } from '@/lib/issues';

// Locale'dan mustaqil statik sahifalar (news/[category]/[slug], sonlar-arxivi/[id]
// va toifalar dinamik ravishda pastda backend'dan olinadi).
const STATIC_PATHS = [
  '',
  '/jamoa',
  '/gazeta-haqida',
  '/gazeta-haqida/maqsad-va-vazifalar',
  '/gazeta-haqida/hamkorlik',
  '/gazeta-haqida/korrupsiyaga-qarshi-kurashish',
  '/sonlar-arxivi',
  '/yangiliklar',
  '/aloqalar',
  '/aloqalar/manzil',
  '/aloqalar/rekvizitlar',
  '/aloqalar/qabul-jadvali',
  '/aloqalar/xaridorlar-uchun',
  '/aloqalar/murojaat',
  '/xizmatlar',
  '/xizmatlar/sorov',
  '/xizmatlar/forum',
  '/xizmatlar/savol-javob',
  '/xizmatlar/ttbs',
  '/xizmatlar/obuna',
];

/** Bir xil `path`ni barcha locale'lar uchun bir xil deb hisoblab hreflang alternate'lar yasaydi. */
function sameSameAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = getSiteUrl() + localizedPath(l, path);
  }
  languages['x-default'] = getSiteUrl() + localizedPath(routing.defaultLocale, path);
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  // --- Statik sahifalar ---
  for (const path of STATIC_PATHS) {
    const languages = sameSameAlternates(path);
    for (const locale of routing.locales) {
      entries.push({
        url: siteUrl + localizedPath(locale, path),
        alternates: { languages },
      });
    }
  }

  // --- Yangiliklar toifalari (NewsCategory.slug locale'dan mustaqil) ---
  const categories = await getCategories(routing.defaultLocale);
  for (const category of categories) {
    const path = `/yangiliklar/${category.slug}`;
    const languages = sameSameAlternates(path);
    for (const locale of routing.locales) {
      entries.push({
        url: siteUrl + localizedPath(locale, path),
        alternates: { languages },
      });
    }
  }

  // --- Sonlar arxivi (Issue.id locale'dan mustaqil) ---
  const issues = await getSortedIssues();
  for (const issue of issues) {
    const path = `/sonlar-arxivi/${issue.id}`;
    const languages = sameSameAlternates(path);
    for (const locale of routing.locales) {
      entries.push({
        url: siteUrl + localizedPath(locale, path),
        lastModified: issue.date,
        alternates: { languages },
      });
    }
  }

  // --- Yangilik maqolalari ---
  // MUHIM: NewsTranslation.slug har locale uchun alohida, public API boshqa locale'ning
  // slug'ini bermaydi (Bosqich 4/6/7'da hujjatlashtirilgan cheklov). Shuning uchun har bir
  // locale uchun HAQIQIY (o'sha locale'dan backend'dan olingan) slug bilan alohida yozuv
  // yaratiladi; hreflang alternate'larda boshqa locale'lar sahifa darajasidagi generateMetadata
  // bilan bir xil qoidaga ko'ra shu toifaning ro'yxat sahifasiga yo'naltiriladi — taxminiy
  // slug o'ylab topilmaydi.
  const nonGalleryCategories = categories.filter((c) => c.slug !== 'media-galereya');
  for (const locale of routing.locales) {
    for (const category of nonGalleryCategories) {
      const items = await getNewsByCategory(category.slug, 200, locale);
      for (const item of items) {
        const currentPath = `/yangiliklar/${category.slug}/${item.slug}`;
        const categoryPath = `/yangiliklar/${category.slug}`;
        const languages: Record<string, string> = {};
        for (const l of routing.locales) {
          languages[l] = siteUrl + localizedPath(l, l === locale ? currentPath : categoryPath);
        }
        languages['x-default'] =
          siteUrl + localizedPath(routing.defaultLocale, routing.defaultLocale === locale ? currentPath : categoryPath);

        entries.push({
          url: siteUrl + localizedPath(locale, currentPath),
          lastModified: item.publishedAt,
          alternates: { languages },
        });
      }
    }
  }

  return entries;
}
