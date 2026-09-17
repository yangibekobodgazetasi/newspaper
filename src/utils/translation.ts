import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';

// Faqat shu faylga kerak bo'lgan minimal maydonlar — Prisma Client hali generatsiya
// qilinmagan muhitda ham (masalan shu sandbox) implicit-any xatolarisiz kompilyatsiya bo'lishi uchun.
interface LanguageRow {
  code: string;
  isDefault: boolean;
}

export interface LanguageContext {
  /** Faol tillar kodlari, masalan ["uz", "ru", "en"] */
  activeLocales: string[];
  /** Standart til kodi (Language.isDefault=true) — fallback shu tilga tushadi */
  defaultLocale: string;
}

export interface ResolvedLocale {
  /** So'ralgan (yoki unga tushgan) haqiqiy til — javob shu tilda qaytariladi */
  locale: string;
  /** Standart til — pickTranslation ichida fallback sifatida ishlatiladi */
  defaultLocale: string;
}

/**
 * Faol tillar ro'yxati va standart tilni bitta so'rov bilan oladi.
 * `Language` jadvali kichik (bir necha o'nlab yozuv) bo'lgani uchun har safar
 * to'liq o'qish arzon — keshlashga hozircha ehtiyoj yo'q.
 */
export async function getLanguageContext(): Promise<LanguageContext> {
  const languages: LanguageRow[] = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const defaultLang = languages.find((l: LanguageRow) => l.isDefault) ?? languages[0];

  if (!defaultLang) {
    // Bu holat production'da yuz bermasligi kerak (seed doim kamida bitta standart tilni yaratadi),
    // lekin noto'g'ri sozlangan bazada tushunarli xato berish uchun aniq tekshiramiz.
    throw new ApiError(500, "Hech qanday faol til topilmadi — kamida bitta Language yozuvi isActive=true va isDefault=true bo'lishi kerak");
  }

  return {
    activeLocales: languages.map((l: LanguageRow) => l.code),
    defaultLocale: defaultLang.code,
  };
}

/**
 * So'ralgan tilni (`?lang=`) tekshiradi: faol tillar orasida bo'lmasa yoki
 * umuman yuborilmagan bo'lsa, standart tilga (`defaultLocale`) tushadi.
 * Barcha route'lar shu funksiyani chaqirib boshlaydi — DRY.
 */
export async function resolveLocale(requestedLocale?: string): Promise<ResolvedLocale> {
  const { activeLocales, defaultLocale } = await getLanguageContext();
  const locale = requestedLocale && activeLocales.includes(requestedLocale) ? requestedLocale : defaultLocale;
  return { locale, defaultLocale };
}

/**
 * Tarjimalar massividan kerakli tilni tanlaydi:
 * 1) so'ralgan til topilsa — o'sha
 * 2) topilmasa — standart til (`defaultLocale`)
 * 3) u ham bo'lmasa — mavjud birinchi tarjima (oxirgi chora, bo'sh javob qaytarmaslik uchun)
 *
 * Har qanday `{ locale: string }` shakliga ega tarjima jadvali (NewsTranslation,
 * NewsCategoryTranslation, TeamMemberTranslation, StaticContentTranslation) uchun ishlaydi.
 */
export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
  defaultLocale: string
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === defaultLocale) ??
    translations[0]
  );
}

/** Express query parametridan `lang`ni xavfsiz string sifatida oladi. */
export function getRequestedLocale(query: unknown): string | undefined {
  const lang = (query as Record<string, unknown> | undefined)?.lang;
  return typeof lang === 'string' ? lang : undefined;
}

// ============================================
// YOZISH YO'LI: admin panel translations[] validatsiyasi
// (News, NewsCategory, TeamMember, StaticContent — barchasi shu yerdan foydalanadi)
// ============================================

export interface ValidateTranslationsOptions {
  /**
   * true bo'lsa (standart), massivda standart til (`defaultLocale`) uchun
   * tarjima bo'lishi shart — bo'lmasa 400 xato qaytariladi.
   */
  requireDefault?: boolean;
}

/**
 * Admin yuborgan `translations[]` massivini tekshiradi:
 * 1) bo'sh bo'lmasligi
 * 2) har bir `locale` faol `Language` orasida bo'lishi
 * 3) bir xil til ikki marta takrorlanmasligi
 * 4) standart til uchun tarjima majburiyligi (agar `requireDefault !== false`)
 *
 * Barcha translation-ga ega entity (News, NewsCategory, TeamMember, StaticContent)
 * create/update route'lari shu bitta funksiyani chaqiradi — DRY va kelajakda
 * yangi entity qo'shilganda ham shu yerga qaytish kifoya.
 */
export async function validateTranslationsInput<T extends { locale: string }>(
  translations: T[],
  options: ValidateTranslationsOptions = {}
): Promise<LanguageContext> {
  const context = await getLanguageContext();
  const { activeLocales, defaultLocale } = context;

  if (translations.length === 0) {
    throw new ApiError(400, 'Kamida bitta til uchun tarjima kiritilishi shart');
  }

  const locales = translations.map((t) => t.locale);

  const invalidLocales = [...new Set(locales.filter((l) => !activeLocales.includes(l)))];
  if (invalidLocales.length > 0) {
    throw new ApiError(400, `Noma'lum yoki nofaol til kodi: ${invalidLocales.join(', ')}`);
  }

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const l of locales) {
    if (seen.has(l)) duplicates.add(l);
    seen.add(l);
  }
  if (duplicates.size > 0) {
    throw new ApiError(400, `Til takrorlangan: ${[...duplicates].join(', ')}`);
  }

  if ((options.requireDefault ?? true) && !locales.includes(defaultLocale)) {
    throw new ApiError(400, `Standart til (${defaultLocale}) uchun tarjima majburiy`);
  }

  return context;
}

/**
 * Kelajakda AI-tarjima integratsiyasi uchun umumiy meta-maydonlar shakli.
 * Hozircha hech qaysi route bu qiymatlarni to'ldirmaydi (barcha yozuvlar
 * `origin: HUMAN` bilan yaratiladi — schema standart qiymati), lekin
 * "Translate" tugmasi qo'shilganda shu interfeys orqali to'ldiriladi.
 */
export interface TranslationOriginMeta {
  origin?: 'HUMAN' | 'AI';
  aiModel?: string;
  translatedAt?: Date;
  isReviewed?: boolean;
}
