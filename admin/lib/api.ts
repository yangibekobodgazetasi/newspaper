'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'yb_admin_token';
const USER_KEY = 'yb_admin_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

/** Serverdan kelgan yangi ma'lumot bilan saqlangan foydalanuvchini almashtiradi (bkl. useCurrentUser). */
export function updateStoredUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export class ApiClientError extends Error {
  status: number;
  /** 0 — server bilan umuman bog'lanib bo'lmadi (tarmoq xatosi). */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * XATOLARNI KO'RSATISHNING YAGONA NUQTASI
 * ---------------------------------------
 * `ToastProvider` mount bo'lganda shu yerga o'z funksiyasini yozib qo'yadi.
 * Shundan keyin HAR QANDAY muvaffaqiyatsiz API chaqiruvi avtomatik ravishda
 * xato toast'ini chiqaradi — har bir sahifa/komponent buni o'zicha qayta
 * yozishi shart emas.
 */
type ApiErrorHandler = (error: ApiClientError) => void;
let apiErrorHandler: ApiErrorHandler | null = null;

export function setApiErrorHandler(handler: ApiErrorHandler | null) {
  apiErrorHandler = handler;
}

/** Server foydali xabar bermagan holatlar uchun status bo'yicha tushunarli matn. */
function fallbackMessage(status: number): string {
  switch (status) {
    case 0: return "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.";
    case 400: return "So'rov noto'g'ri yuborildi.";
    case 401: return 'Avtorizatsiya muddati tugagan. Qaytadan kiring.';
    case 403: return "Bu amal uchun huquqingiz yetarli emas.";
    case 404: return 'Ma\'lumot topilmadi.';
    case 409: return "Bu ma'lumot allaqachon mavjud yoki hozir ishlatilmoqda.";
    case 413: return 'Fayl hajmi juda katta.';
    case 422: return "Ma'lumot talablarga mos kelmadi.";
    case 429: return "Juda ko'p urinish. Biroz kutib, qaytadan urinib ko'ring.";
    case 500: return 'Serverda kutilmagan xatolik yuz berdi.';
    default: return status >= 500 ? 'Server javob bermayapti.' : 'Xatolik yuz berdi.';
  }
}

/** Xatoni yagona kanal orqali ko'rsatadi va chaqiruvchiga qaytaradi (throw uchun). */
function reportError(status: number, message?: string): ApiClientError {
  const error = new ApiClientError(status, message || fallbackMessage(status));
  apiErrorHandler?.(error);
  return error;
}

/** Yuborilgan javobni tekshiradi; xato bo'lsa toast chiqarib, ApiClientError tashlaydi. */
async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({} as { message?: string }));
  const serverMessage = (body as { message?: string }).message;

  if (res.status === 401) {
    // MUHIM: 401 ikki xil vaziyatda keladi.
    //  1) Login sahifasida — parol noto'g'ri. Bunda sessiyani tozalash yoki
    //     yo'naltirish MA'NOSIZ, va "muddati tugagan" degan xabar chalg'itadi;
    //     serverning haqiqiy xabari ("Login yoki parol noto'g'ri") ko'rsatiladi.
    //  2) Boshqa sahifada — token eskirgan. Bunda sessiya tozalanadi va
    //     foydalanuvchi login sahifasiga qaytariladi.
    const onLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login');

    if (onLoginPage) {
      throw reportError(401, serverMessage);
    }

    clearSession();
    const error = reportError(401, serverMessage);
    // Toast ko'rinib ulgurishi uchun yo'naltirishni bir oz kechiktiramiz.
    setTimeout(() => { window.location.href = '/login'; }, 1200);
    throw error;
  }

  if (!res.ok) {
    throw reportError(res.status, serverMessage);
  }

  return body as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // `fetch` faqat tarmoq darajasidagi muammoda tashlaydi (server o'chiq, DNS va h.k.)
    throw reportError(0);
  }

  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/**
 * Multipart/form-data yuklash uchun alohida funksiya — Content-Type header'ini
 * qo'yish shart emas (brauzer o'zi to'g'ri boundary bilan qo'yadi).
 */
export async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
  } catch {
    throw reportError(0);
  }

  return handleResponse<T>(res);
}
