import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

export const SITE_NAME = 'Yangi Bekobod';

let misconfigWarned = false;

/**
 * Production domenini o'zboshimchalik bilan taxmin qilmaslik uchun — muhit
 * o'zgaruvchisidan olinadi. Production'da `NEXT_PUBLIC_SITE_URL` haqiqiy domenga
 * sozlanishi SHART (aks holda canonical/hreflang/OG/sitemap localhost'ga ishora qiladi
 * va sayt qidiruv tizimlarida noto'g'ri indekslanadi).
 *
 * Eslatma: bu qiymat build vaqtida kodga "inline" qilinadi (NEXT_PUBLIC_ prefiksi),
 * ya'ni o'zgartirilgandan keyin qayta build qilish kerak.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Noto'g'ri sozlash jimgina o'tib ketmasligi uchun — bir marta ogohlantiramiz.
  if (!misconfigWarned && process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/.test(raw)) {
    misconfigWarned = true;
    console.warn(
      '[seo] NEXT_PUBLIC_SITE_URL production build uchun localhost qiymatida qolgan. ' +
        'canonical/hreflang/OG/sitemap noto\'g\'ri manzillarni ko\'rsatadi — .env faylida haqiqiy domenni ko\'rsating.'
    );
  }

  return raw.replace(/\/+$/, ''); // oxiridagi "/" ikkilanmasligi uchun
}

const OG_LOCALE_MAP: Record<string, string> = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };

/** `locale` + locale'siz yo'l ("/jamoa") -> to'liq lokalizatsiyalangan yo'l ("/uz/jamoa"). */
export function localizedPath(locale: string, path: string): string {
  return `/${locale}${path}`;
}

interface BuildMetadataParams {
  locale: string;
  /** Joriy locale uchun locale'siz yo'l, masalan "/jamoa" yoki "/yangiliklar/elonlar/some-slug". */
  path: string;
  /** Sahifa title'i — root layout'dagi `title.template` orqali " — Yangi Bekobod" avtomatik qo'shiladi. */
  title: string;
  description?: string;
  /**
   * Boshqa locale'lar uchun path bir xil bo'lmasa (masalan yangilik detail sahifasida
   * slug har til uchun alohida) — shu locale uchun path'ni shu yerda ustidan yoz.
   * Berilmasa — barcha locale'lar uchun bir xil `path` ishlatiladi.
   */
  alternatePaths?: Partial<Record<string, string>>;
  image?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string;
  authors?: string[];
}

/**
 * Barcha sahifalar uchun yagona metadata quruvchisi — canonical, hreflang (barcha
 * faol locale'lar + x-default), Open Graph va Twitter kartalarini bir joyda yig'adi.
 * Har bir `page.tsx`da bu funksiyani takror yozmaslik uchun DRY qilib chiqarilgan.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  alternatePaths,
  image,
  type = 'website',
  publishedTime,
  authors,
}: BuildMetadataParams): Metadata {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localizedPath(l, alternatePaths?.[l] ?? path);
  }
  languages['x-default'] = localizedPath(
    routing.defaultLocale,
    alternatePaths?.[routing.defaultLocale] ?? path
  );

  const url = localizedPath(locale, path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE_MAP[locale] ?? locale,
      type,
      ...(image ? { images: [{ url: image }] } : {}),
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && authors ? { authors } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
