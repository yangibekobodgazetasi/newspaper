/**
 * Backend API bilan ishlash uchun yagona fetch wrapper.
 * Server komponentlarida ishlatiladi — build/request vaqtida backendga so'rov yuboradi.
 *
 * NEXT_PUBLIC_API_URL .env.local orqali sozlanadi (masalan production'da
 * https://api.yangibekobod.uz/api). Standart holatda mahalliy backend/mock-server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Backend'dan kelgan nisbiy `/uploads/...` yo'lini to'liq URL'ga aylantiradi. */
export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_ORIGIN}${path}`;
}

/**
 * Yuklangan fayl (masalan gazeta soni PDF'i) manzilini hal qiladi.
 *
 * `resolveImageUrl` dan farqi: FAQAT `/uploads/...` yo'llariga backend manzili
 * qo'shiladi. Sababi — `Issue.pdfUrl` da admin panel orqali yuklanmagan eski
 * qiymatlar ham bor (masalan `/issues/8043.pdf`); ularni backendga yo'naltirish
 * noto'g'ri bo'lardi, shuning uchun o'z holicha qoldiriladi.
 */
export function resolveUploadUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `${BACKEND_ORIGIN}${path}`;
  return path;
}

interface FetchOptions {
  revalidate?: number | false; // ISR: soniyada qayta generatsiya; false = statik (build vaqtida bir marta)
  cache?: RequestCache;
  /** URL'dagi [locale] segmenti — berilsa, so'rovga `?lang=` sifatida qo'shiladi. */
  locale?: string;
}

/** Mavjud query parametrlarni saqlab, `lang`ni URLSearchParams orqali xavfsiz qo'shadi. */
function buildUrl(path: string, locale?: string): string {
  if (!locale) return `${API_BASE_URL}${path}`;

  const [pathname, query] = path.split('?');
  const params = new URLSearchParams(query);
  params.set('lang', locale);
  return `${API_BASE_URL}${pathname}?${params.toString()}`;
}

/**
 * Backenddan kelgan barcha javoblar shu YAGONA keshtegi bilan belgilanadi.
 *
 * SABAB: `revalidate: 3600` bilan admin paneldagi har qanday o'zgarish (jamoa rasmi,
 * yangilik, hamkor logotipi...) frontendda BIR SOATGACHA ko'rinmasdi — keshni
 * bekor qilishning hech qanday yo'li yo'q edi. Endi backend har bir muvaffaqiyatli
 * admin mutatsiyasidan keyin `/api/revalidate` ni chaqiradi va shu teg bekor
 * qilinadi (`backend/src/utils/revalidate.ts`).
 *
 * Ataylab bitta umumiy teg: sayt kichik, admin yozuvlari kam, resurs bo'yicha
 * teglar xaritasini ikki loyihada sinxron ushlab turish esa xatolar manbai bo'lardi.
 * `revalidate` vaqti xavfsizlik to'ri sifatida saqlanadi — hook ishlamay qolsa ham
 * kontent bir soatda baribir yangilanadi.
 */
export const API_CACHE_TAG = 'api';

/** HTTP status kodini saqlaydigan xato — "topilmadi" (404) ni vaqtinchalik xatolardan ajratish uchun. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = buildUrl(path, options.locale);

  const res = await fetch(url, {
    next:
      options.revalidate === false
        ? { tags: [API_CACHE_TAG] }
        : { revalidate: options.revalidate ?? 3600, tags: [API_CACHE_TAG] },
    cache: options.cache,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API xatosi (${res.status}): ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API xatosi (${res.status}): ${path}`);
  }

  return res.json() as Promise<T>;
}
