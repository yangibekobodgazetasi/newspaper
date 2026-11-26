/**
 * Rubrika nomi bo'yicha barqaror indeks qaytaradi (0-5) — shu asosda
 * CSS modulida `badge0`..`badge5` klasslaridan biri tanlanadi.
 * Bir xil rubrika (masalan "Ogohlik") doim bir xil rangda chiqishi uchun
 * tasodifiy emas, matn asosidagi oddiy hash ishlatiladi.
 */
export function getBadgeIndex(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 6;
  }
  return Math.abs(hash) % 6;
}
