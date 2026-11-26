/**
 * MUHIM: bu faylda ataylab `Intl`/`toLocaleDateString` ISHLATILMAYDI. Node (server) va
 * brauzer (hydration) `uz-UZ` locale uchun turli ICU ma'lumotlariga ega — brauzer bu
 * locale'ni qo'llab-quvvatlamay, "2026 M06 30" kabi umumiy formatga tushib qoladi va
 * natijada SSR/CSR matni mos kelmay React hydration xatosini beradi. ISO satrni
 * to'g'ridan-to'g'ri parse qilish server va brauzerda bir xil natija berishini
 * kafolatlaydi (timezone ham ta'sir qilmaydi, chunki Date obyekti umuman yaratilmaydi).
 *
 * Shu sababli oy nomlari qo'lda yozilgan. Yangi til qo'shilsa — shu jadvalga ham
 * qo'shiladi; topilmasa standart til (uz) ishlatiladi, ya'ni sahifa buzilmaydi.
 */
const MONTHS: Record<string, string[]> = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

const DEFAULT_LOCALE = 'uz';

/**
 * Sanani tanlangan tilda yozadi:
 *   uz -> "30-iyun, 2026"
 *   ru -> "30 июня 2026"
 *   en -> "June 30, 2026"
 */
export function formatLocalizedDate(iso: string, locale: string = DEFAULT_LOCALE): string {
  const [year, month, day] = iso.slice(0, 10).split('-');
  const months = MONTHS[locale] ?? MONTHS[DEFAULT_LOCALE];
  const monthName = months[parseInt(month, 10) - 1];
  const dayNumber = parseInt(day, 10);

  if (locale === 'en') return `${monthName} ${dayNumber}, ${year}`;
  if (locale === 'ru') return `${dayNumber} ${monthName} ${year}`;
  return `${dayNumber}-${monthName}, ${year}`;
}
