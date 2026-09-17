const BUSINESS_TIMEZONE = 'Asia/Tashkent';

/**
 * Joriy "biznes kuni"ni 'YYYY-MM-DD' ko'rinishida qaytaradi — server yoki mijoz brauzeri
 * qaysi timezone'da ishlashidan qat'iy nazar, doim Asia/Tashkent bo'yicha hisoblanadi
 * (kunlik limitlar shu asosda ishlaydi).
 */
export function getBusinessDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    date
  );
}
