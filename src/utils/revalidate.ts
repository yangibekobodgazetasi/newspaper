import type { NextFunction, Request, Response } from 'express';

/**
 * FRONTEND KESHINI BEKOR QILISH
 * =============================
 * Frontend (Next.js) backenddan kelgan javoblarni `revalidate: 3600` bilan keshlaydi.
 * Bu hook bo'lmasa admin paneldagi o'zgarish (jamoa rasmi, yangilik, hamkor logotipi...)
 * saytda BIR SOATGACHA ko'rinmaydi — aynan shu sabab "yuklangan rasm frontendda
 * ko'rinmayapti" muammosiga olib kelgan edi.
 *
 * Ishlashi: har bir MUVAFFAQIYATLI admin mutatsiyasidan (POST/PUT/PATCH/DELETE)
 * keyin frontenddagi `/api/revalidate` chaqiriladi va u yagona `api` keshtegini
 * bekor qiladi (bkl. `frontend/lib/api.ts` dagi `API_CACHE_TAG` izohi).
 *
 * Sozlash (backend `.env`):
 *   FRONTEND_REVALIDATE_URL=http://localhost:3000/api/revalidate
 *   REVALIDATE_SECRET=<frontenddagi bilan bir xil qiymat>
 * Ikkalasi ham bo'lmasa hook jim o'chiriladi — backend baribir ishlayveradi,
 * frontend esa `revalidate` vaqti tugagach yangilanadi (xavfsizlik to'ri).
 */

let missingConfigWarned = false;

function isEnabled(): boolean {
  return Boolean(process.env.FRONTEND_REVALIDATE_URL && process.env.REVALIDATE_SECRET);
}

/**
 * Frontend keshini bekor qilishni so'raydi. Ataylab "fire-and-forget":
 * frontend o'chirilgan/javob bermayotgan bo'lsa ham admin so'rovi muvaffaqiyatli
 * yakunlanishi kerak — kesh yangilash yordamchi vazifa, asosiy oqim emas.
 */
export function revalidateFrontend(reason: string): void {
  if (!isEnabled()) {
    if (!missingConfigWarned) {
      missingConfigWarned = true;
      console.warn(
        '[revalidate] FRONTEND_REVALIDATE_URL yoki REVALIDATE_SECRET sozlanmagan — ' +
          "frontend keshi faqat `revalidate` vaqti tugagach yangilanadi."
      );
    }
    return;
  }

  const url = process.env.FRONTEND_REVALIDATE_URL as string;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': process.env.REVALIDATE_SECRET as string,
    },
    body: JSON.stringify({ reason }),
    signal: AbortSignal.timeout(5000),
  })
    .then((res) => {
      if (!res.ok) console.warn(`[revalidate] ${reason}: frontend ${res.status} qaytardi`);
    })
    .catch((err: unknown) => {
      console.warn(`[revalidate] ${reason}: so'rov yuborilmadi —`, err instanceof Error ? err.message : err);
    });
}

/**
 * Admin router'ining eng boshiga o'rnatiladi. Har bir yangi admin route
 * avtomatik qamrab olinadi — yangi endpoint qo'shganda bu yerni yangilash
 * (va unutish) shart emas.
 *
 * `res.on('finish')` javob to'liq yuborilgandan keyin ishlaydi, ya'ni
 * status kod aniq ma'lum: xato (>=400) bo'lsa kesh bekor qilinmaydi.
 */
export function revalidateOnMutation(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      revalidateFrontend(`${req.method} ${req.originalUrl}`);
    }
  });

  next();
}
