import { apiFetch } from './api';
import type { HomePromo, HomeStats } from '@/types';

/**
 * GET /api/home/promo?lang= — bosh sahifadagi promo kartasi (sarlavha + fon rasmi).
 *
 * Backend hech qachon 404 qaytarmaydi: admin hech narsa kiritmagan bo'lsa maydonlar
 * `null` bo'ladi va karta o'zining standart ko'rinishida (tarjima fayllaridagi
 * sarlavha + gradient fon) qoladi. Shunga qaramay tarmoq xatosi butun bosh sahifani
 * yiqitmasligi uchun bu yerda ham xavfsiz qiymat qaytariladi.
 */
export async function getHomePromo(locale?: string): Promise<HomePromo> {
  try {
    return await apiFetch<HomePromo>('/home/promo', { locale });
  } catch {
    return { heading: null, image: null };
  }
}

/**
 * GET /api/home/stats — "Haftalik statistika" vidjeti uchun haqiqiy sonlar.
 * Tildan mustaqil (raqamlar), shuning uchun `locale` uzatilmaydi. Tez-tez
 * o'zgarmaydigan ma'lumot — 5 daqiqalik keshlash yetarli, lekin doim yangi
 * qiymatni ko'rsatib turadi (bir soatlik umumiy API keshidan farqli).
 */
export async function getHomeStats(): Promise<HomeStats> {
  try {
    return await apiFetch<HomeStats>('/home/stats', { revalidate: 300 });
  } catch {
    return { discussions: 0, subscribers: 0 };
  }
}
