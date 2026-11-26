// Frontenddagi types/index.ts bilan bir xil qiymatlar — ikkala tomon ham shu konstantaga rioya qiladi.

export const NEWS_CATEGORY_SLUGS = [
  'kundalik-yangiliklar',
  'ommaviy-tadbirlar',
  'rahbariyat-bayonotlari',
  'oav-biz-haqimizda',
  'elonlar',
] as const;

export type NewsCategorySlug = (typeof NEWS_CATEGORY_SLUGS)[number];

export const COVER_VARIANTS = ['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4'] as const;
export type CoverVariant = (typeof COVER_VARIANTS)[number];

export const ABOUT_SLUGS = [
  'umumiy',
  'maqsad-va-vazifalar',
  'hamkorlik',
  'korrupsiyaga-qarshi-kurashish',
] as const;
export type AboutSlug = (typeof ABOUT_SLUGS)[number];

export const LOCALES = ['uz-latin', 'uz-cyrillic', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export function isNewsCategory(value: string): value is NewsCategorySlug {
  return (NEWS_CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function isAboutSlug(value: string): value is AboutSlug {
  return (ABOUT_SLUGS as readonly string[]).includes(value);
}

// ---- Admin rollari ----
// Rollar va huquqlar endi SHU YERDA EMAS — `src/types/permissions.ts` da.
// Ilgari bu yerda `STAFF_ROLES` / `MODERATOR_ROLES` / `PUBLISHER_ROLES` massivlari
// bor edi va har bir route o'zi qaysi rollarga ruxsat berishini takrorlardi.
// Yagona manba uchun ular olib tashlandi (bkl. types/permissions.ts).
