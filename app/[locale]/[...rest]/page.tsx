import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

/**
 * MOS KELMAGAN MANZILLARNI USHLAB OLUVCHI ROUTE
 * =============================================
 * Busiz `/uz/mavjud-emas` kabi manzil HECH QAYSI route segmentiga tushmasdi va
 * Next.js o'zining ichki (dizaynsiz, tarjimasiz) 404 sahifasini ko'rsatardi —
 * `[locale]/not-found.tsx` esa faqat route ICHIDA `notFound()` chaqirilganda
 * ishlaydi.
 *
 * Bu catch-all manzilni `[locale]` segmentiga "moslashtirib", so'ng darhol
 * `notFound()` chaqiradi. Natijada bizning 404 sahifamiz Header/Footer va
 * to'g'ri til bilan render bo'ladi.
 */
export default async function CatchAllNotFound(props: { params: Promise<{ locale: string }> }) {
 const params = await props.params;

 const {
  locale
 } = params;

 // Statik generatsiyada tarjimalar to'g'ri tilda bo'lishi uchun.
 setRequestLocale(locale);
 notFound();
}
