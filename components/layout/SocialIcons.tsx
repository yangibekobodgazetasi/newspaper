/**
 * Ijtimoiy tarmoq (brend) ikonkalari — Facebook/Instagram/YouTube.
 *
 * `lucide-react` 1.x versiyasida (Next.js 16 uchun React 19'ga o'tishda kerak
 * bo'ldi) brend logotiplari butunlay olib tashlangan (litsenziya sababli —
 * ko'plab ikon kutubxonalari shunday yo'l tutgan). Faqat shu bitta joyda
 * ishlatilgani uchun yangi kutubxona qo'shish o'rniga oddiy inline SVG bilan
 * almashtirildi — `lucide-react`dagi `Send` (Telegram) bilan bir xil `size`
 * prop interfeysini saqlaydi, shuning uchun `UtilityBar.tsx` o'zgarishsiz qoladi.
 */
interface IconProps {
  size?: number;
}

export function Facebook({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export function Instagram({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.25 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.13s-.01 3.07-.06 4.13c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.07-.01-4.13-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.07 2 14.73 2 12s.01-3.07.06-4.13c.05-1.06.22-1.79.47-2.43.25-.66.6-1.21 1.15-1.76a4.9 4.9 0 0 1 1.76-1.15c.64-.25 1.37-.42 2.43-.47C8.93 2.01 9.27 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.25A3.25 3.25 0 1 1 12 8.75a3.25 3.25 0 0 1 0 6.5ZM17.4 6.85a1.17 1.17 0 1 1-2.34 0 1.17 1.17 0 0 1 2.34 0Z" />
    </svg>
  );
}

export function Youtube({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.58 7.2a2.75 2.75 0 0 0-1.93-1.95C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.65.5A2.75 2.75 0 0 0 2.42 7.2 28.6 28.6 0 0 0 1.92 12a28.6 28.6 0 0 0 .5 4.8 2.75 2.75 0 0 0 1.93 1.95c1.75.5 7.65.5 7.65.5s5.9 0 7.65-.5a2.75 2.75 0 0 0 1.93-1.95c.33-1.57.5-3.18.5-4.8a28.6 28.6 0 0 0-.5-4.8ZM9.98 15.02V8.98L15.5 12l-5.52 3.02Z" />
    </svg>
  );
}
