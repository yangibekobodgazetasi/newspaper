import { apiFetch } from './api';
import type { AboutContent } from '@/types';

export type AboutSlug = 'umumiy' | 'maqsad-va-vazifalar' | 'hamkorlik' | 'korrupsiyaga-qarshi-kurashish';

// `labelKey` — to'liq namespace'li translation kaliti (masalan "nav.aboutOverview"),
// SubNav shu bo'lim uchun asosiy navigatsiya bilan bir xil label'larni ishlatadi — DRY.
export const ABOUT_PAGES: { slug: AboutSlug; href: string; labelKey: string }[] = [
  { slug: 'umumiy', href: '/gazeta-haqida', labelKey: 'nav.aboutOverview' },
  { slug: 'maqsad-va-vazifalar', href: '/gazeta-haqida/maqsad-va-vazifalar', labelKey: 'nav.aboutGoals' },
  { slug: 'hamkorlik', href: '/gazeta-haqida/hamkorlik', labelKey: 'nav.aboutPartnership' },
  { slug: 'korrupsiyaga-qarshi-kurashish', href: '/gazeta-haqida/korrupsiyaga-qarshi-kurashish', labelKey: 'nav.aboutAntiCorruption' },
];

/** GET /api/about?lang= (umumiy) yoki /api/about/:slug?lang= (qolgan 3 tasi) */
export async function getAboutContent(slug: AboutSlug, locale?: string): Promise<AboutContent> {
  const path = slug === 'umumiy' ? '/about' : `/about/${slug}`;
  return apiFetch<AboutContent>(path, { locale });
}
