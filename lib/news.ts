import { apiFetch } from './api';
import type { NewsItem, MediaItem, NewsCategorySlug } from '@/types';
import type { Paginated } from './types';

export interface NewsCategoryMeta {
  slug: NewsCategorySlug;
  label: string;
  description: string;
  isSystem?: boolean;
}

/** GET /api/news/categories?lang= — endi backend'da dinamik boshqariladi (admin panelda qo'shish mumkin) */
export async function getCategories(locale?: string): Promise<NewsCategoryMeta[]> {
  const data = await apiFetch<{ items: NewsCategoryMeta[] }>('/news/categories', { revalidate: 300, locale });
  return data.items;
}

export async function isValidCategory(slug: string, locale?: string): Promise<boolean> {
  const categories = await getCategories(locale);
  return categories.some((c) => c.slug === slug);
}

export async function getCategoryMeta(slug: NewsCategorySlug, locale?: string): Promise<NewsCategoryMeta | undefined> {
  const categories = await getCategories(locale);
  return categories.find((c) => c.slug === slug);
}

/** GET /api/news/:category?lang= */
export async function getNewsByCategory(slug: NewsCategorySlug, pageSize = 24, locale?: string): Promise<NewsItem[]> {
  const data = await apiFetch<Paginated<NewsItem>>(`/news/${slug}?pageSize=${pageSize}`, { locale });
  return data.items;
}

/** Sahifalash ma'lumoti (total) kerak bo'lgan joylar uchun — masalan /yangiliklar indeksidagi hisoblagich */
export async function getNewsCategoryPage(slug: NewsCategorySlug, pageSize = 24, locale?: string): Promise<Paginated<NewsItem>> {
  return apiFetch<Paginated<NewsItem>>(`/news/${slug}?pageSize=${pageSize}`, { locale });
}

/** GET /api/news/:category/:slug?lang= */
export async function getNewsBySlug(category: NewsCategorySlug, slug: string, locale?: string): Promise<NewsItem | undefined> {
  try {
    return await apiFetch<NewsItem>(`/news/${category}/${slug}`, { locale });
  } catch {
    return undefined;
  }
}

/** GET /api/news/media-galereya — media galereya hozircha tarjima qilinmaydi, `lang` uzatilmaydi */
export async function getMediaItems(pageSize = 24): Promise<MediaItem[]> {
  const data = await apiFetch<Paginated<MediaItem>>(`/news/media-galereya?pageSize=${pageSize}`);
  return data.items;
}

/**
 * "O'xshash yangiliklar" bloki — alohida backend endpoint yo'q, shuning uchun
 * shu toifaning ro'yxatini olib, joriy maqolani chetlab o'tamiz.
 */
export async function getRelatedNews(current: NewsItem, limit = 3, locale?: string): Promise<NewsItem[]> {
  const items = await getNewsByCategory(current.rubricSlug, 24, locale);
  return items.filter((n) => n.id !== current.id).slice(0, limit);
}

/** Bosh sahifadagi hero karuseli uchun — barcha toifalar bo'yicha "Bosh material" (featured=true) yangiliklar */
export async function getFeaturedNews(locale?: string): Promise<NewsItem[]> {
  const categories = await getCategories(locale);
  const lists = await Promise.all(
    categories.filter((c) => c.slug !== 'media-galereya').map((c) => getNewsByCategory(c.slug, 50, locale))
  );
  return lists
    .flat()
    .filter((n) => n.featured)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/**
 * GET /api/news/search?q=&lang= — sarlavha/qisqacha mazmun bo'yicha qidiruv.
 * Har foydalanuvchi so'roviga xos bo'lgani uchun keshlanmaydi (`revalidate: 0`).
 * 2 belgidan qisqa so'rovni backend ham rad etadi — shu yerda ham tekshirib,
 * ortiqcha so'rovni oldindan to'xtatamiz.
 */
export async function searchNews(query: string, pageSize = 24, locale?: string): Promise<Paginated<NewsItem>> {
  const q = query.trim();
  if (q.length < 2) return { items: [], page: 1, pageSize, total: 0 };

  const params = new URLSearchParams({ q, pageSize: String(pageSize) });
  return apiFetch<Paginated<NewsItem>>(`/news/search?${params.toString()}`, { locale, revalidate: 0 });
}

export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
