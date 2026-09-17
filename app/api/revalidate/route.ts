import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { API_CACHE_TAG } from '@/lib/api';

/**
 * Backend admin panelida biror narsa o'zgargach chaqiradigan hook.
 *
 * `apiFetch` javoblarni `revalidate: 3600` bilan keshlaydi — bu bo'lmasa admin
 * o'zgarishi frontendda bir soatgacha ko'rinmaydi. Shu endpoint kesh tegini bekor
 * qiladi va keyingi so'rov ma'lumotni backenddan qaytadan oladi.
 *
 * Xavfsizlik: endpoint public (middleware `/api` ni chetlab o'tadi), shuning uchun
 * `REVALIDATE_SECRET` majburiy. Sir sozlanmagan bo'lsa endpoint umuman ishlamaydi —
 * "sir yo'q = hamma chaqira oladi" holatiga yo'l qo'yilmaydi.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: 'REVALIDATE_SECRET sozlanmagan' },
      { status: 503 }
    );
  }

  const provided = request.headers.get('x-revalidate-secret');
  if (!provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ revalidated: false, message: "Ruxsat yo'q" }, { status: 401 });
  }

  revalidateTag(API_CACHE_TAG);

  return NextResponse.json({ revalidated: true, tag: API_CACHE_TAG });
}

/** Sirni taqqoslashda vaqt bo'yicha (timing) sizib chiqishning oldini oladi. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // `timingSafeEqual` uzunliklar teng bo'lishini talab qiladi; uzunlik farqi
  // baribir sirning o'zini oshkor qilmaydi.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
