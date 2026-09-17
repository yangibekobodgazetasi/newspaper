import { prisma } from '../lib/prisma';

/**
 * O'zbekcha sarlavhani URL-friendly slug'ga aylantiradi.
 * Masalan: "Prezidentimiz yoshlar bilan uchrashdi" -> "prezidentimiz-yoshlar-bilan-uchrashdi"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/o'|o‘|oʻ/g, 'o')
    .replace(/g'|g‘|gʻ/g, 'g')
    .replace(/['‘’ʻ]/g, '')
    .replace(/[^a-z0-9а-яё\s-]/gi, '') // lotin/kirill harflar, raqam, bo'sh joy va tire qoladi
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Yangilik slug'i bazada shu TIL doirasida band bo'lsa -2, -3 ... qo'shib,
 * unikal variant topadi (`@@unique([locale, slug])` — har til o'z slug fazosiga ega).
 * `excludeNewsId` — tahrirlashda joriy yangilikning o'zini hisobga olmaslik uchun.
 */
export async function generateUniqueNewsSlug(title: string, locale: string, excludeNewsId?: string): Promise<string> {
  const base = slugify(title) || 'yangilik';
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.newsTranslation.findUnique({
      where: { locale_slug: { locale, slug: candidate } },
    });
    if (!existing || existing.newsId === excludeNewsId) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

/**
 * Toifa slug'i (`NewsCategory.slug`) — barcha tillarda bir xil, o'zgarmas identifikator,
 * shuning uchun til bilan bog'liq emas. Odatda standart til nomidan generatsiya qilinadi.
 */
export async function generateUniqueCategorySlug(label: string): Promise<string> {
  const base = slugify(label) || 'toifa';
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.newsCategory.findUnique({ where: { slug: candidate } });
    if (!existing) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}
