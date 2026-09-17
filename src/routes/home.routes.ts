import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { resolveLocale, pickTranslation, getRequestedLocale } from '../utils/translation';

// Prisma Client hali generatsiya qilinmagan muhitda ham implicit-any xatolarisiz
// kompilyatsiya bo'lishi uchun minimal mahalliy tip (loyihadagi mavjud naqsh).
interface StaticContentRow {
  locale: string;
  data: unknown;
}

export const HOME_PROMO_KEY = 'home:promo';

const router = Router();

/**
 * GET /api/home/promo?lang=ru — bosh sahifadagi "Bekobod — imkoniyatlar shahri"
 * promo kartasi (sarlavha + fon rasmi).
 *
 * MUHIM: `getStaticContentData` dan farqli, yozuv topilmasa 404 EMAS, balki bo'sh
 * qiymatlar qaytariladi. Sabab: promo kartasi ixtiyoriy — admin hech narsa
 * kiritmagan bo'lsa frontend avvalgi standart holatini (tarjima fayllaridagi
 * sarlavha + gradient fon) ko'rsatishda davom etadi.
 */
router.get(
  '/promo',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));

    const rows: StaticContentRow[] = await prisma.staticContentTranslation.findMany({
      where: { key: HOME_PROMO_KEY },
    });

    // SARLAVHA — ataylab fallback QILINMAYDI. So'ralgan til uchun yozuv bo'lmasa
    // `null` qaytadi va frontend o'zining tarjima faylidagi sarlavhani ishlatadi.
    // Standart tilga tushirilsa, /ru sahifasida o'zbekcha sarlavha chiqib, mavjud
    // to'g'ri ruscha tarjima yo'qolgan bo'lardi.
    const own = rows.find((r) => r.locale === locale);
    const ownData = (own?.data ?? {}) as { heading?: unknown };

    // RASM — tarjima qilinmaydigan qiymat, shuning uchun odatdagi fallback ishlaydi
    // (bir marta yuklangan fon barcha tillarda ko'rinadi).
    const anyRecord = pickTranslation<StaticContentRow>(rows, locale, defaultLocale);
    const anyData = (anyRecord?.data ?? {}) as { image?: unknown };

    res.json({
      heading: typeof ownData.heading === 'string' && ownData.heading.trim() ? ownData.heading : null,
      image: typeof anyData.image === 'string' && anyData.image.trim() ? anyData.image : null,
    });
  })
);

/**
 * GET /api/home/stats — bosh sahifadagi "Haftalik statistika" vidjeti uchun.
 *
 * `discussions` — forum bo'limidagi haqiqiy faollik: mavzular soni + ularga
 * yozilgan javoblar yig'indisi (`ForumTopic.replyCount`). Alohida "javoblar"
 * jadvali yo'q — sonlar shu bitta ustunda saqlanadi (bkl. forum.routes.ts).
 * `subscribers` — obuna bo'lgan foydalanuvchilar soni.
 *
 * Ataylab keshlanmaydigan yakuniy raqam emas — frontend buni o'zi qisqa
 * `revalidate` bilan keshlaydi (bkl. lib/home.ts). Sayt hali yangi bo'lgani
 * uchun raqamlar hozircha kichik bo'lishi mumkin — bu KUTILGAN holat, "chiroyli
 * ko'rinish uchun" soxta katta son qo'yish o'rniga haqiqiy holat ko'rsatiladi.
 */
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [topicCount, replySum, subscriberCount] = await Promise.all([
      prisma.forumTopic.count(),
      prisma.forumTopic.aggregate({ _sum: { replyCount: true } }),
      prisma.subscriber.count(),
    ]);

    res.json({
      discussions: topicCount + (replySum._sum.replyCount ?? 0),
      subscribers: subscriberCount,
    });
  })
);

export default router;
