/**
 * SAYT SKRINSHOTLARI TAHLILI ASOSIDA ANIQLANGAN RASM SPETSIFIKATSIYALARI
 * ======================================================================
 * Har bir "kind" — frontendning ma'lum bir joyida ishlatiladigan rasm turi.
 * width1x/height1x — tavsiya etilgan standart o'lcham, width2x/height2x — Retina.
 * minWidth — amaliy minimal chegara (haqiqiy foto/generatsiya qilingan rasmlar
 * ko'pincha aynan 1x o'lchamda bo'lmaydi, shuning uchun pastroq qiymat ham qabul qilinadi).
 * Backend yuklangan rasmning aspekt nisbati va o'lchamini shu spetsifikatsiya
 * bilan solishtirib tekshiradi (bkl. utils/validateImage.ts).
 */

// MUHIM: sayt logotipi bu ro'yxatda YO'Q — u admin orqali yuklanadigan dinamik kontent emas,
// balki frontenddagi statik asset (`frontend/public/images/logo.png`, manbasi design/desktop/000.png).
export type MediaKind =
  | 'HERO_BANNER'
  | 'NEWS_COVER'
  | 'ISSUE_COVER'
  | 'TEAM_PHOTO'
  | 'GALLERY_IMAGE'
  | 'PARTNER_LOGO'
  | 'PROMO_BANNER';

export interface ImageSpec {
  kind: MediaKind;
  label: string;
  description: string;
  aspectRatio: number; // width / height
  width1x: number;
  height1x: number;
  width2x: number;
  height2x: number;
  minWidth: number; // amaliy minimal kenglik — bundan kichik rad etiladi
  maxFileSizeMb: number;
  allowedFormats: string[]; // sharp/mime format nomlari
}

export const IMAGE_SPECS: Record<MediaKind, ImageSpec> = {
  HERO_BANNER: {
    kind: 'HERO_BANNER',
    label: 'Bosh sahifa banneri (hero)',
    description: 'Bosh sahifadagi katta bosh material fon rasmi — keng manzarali (16:9)',
    aspectRatio: 16 / 9,
    width1x: 1600,
    height1x: 900,
    width2x: 3200,
    height2x: 1800,
    minWidth: 930, // masalan 930x500 kabi kichikroq, lekin sifatli fotolar ham qabul qilinadi
    maxFileSizeMb: 3,
    allowedFormats: ['jpeg', 'png', 'webp'],
  },
  NEWS_COVER: {
    kind: 'NEWS_COVER',
    label: 'Yangilik muqova rasmi',
    description: 'Yangiliklar grid/kartochkalarida ishlatiladigan rasm (4:3)',
    aspectRatio: 4 / 3,
    width1x: 800,
    height1x: 600,
    width2x: 1600,
    height2x: 1200,
    minWidth: 480,
    maxFileSizeMb: 2,
    allowedFormats: ['jpeg', 'png', 'webp'],
  },
  ISSUE_COVER: {
    kind: 'ISSUE_COVER',
    label: 'Gazeta soni muqovasi',
    description: "Sonlar arxividagi jurnal/gazeta muqovasi — vertikal (3:4)",
    aspectRatio: 3 / 4,
    width1x: 600,
    height1x: 800,
    width2x: 1200,
    height2x: 1600,
    minWidth: 360,
    maxFileSizeMb: 2,
    allowedFormats: ['jpeg', 'png', 'webp'],
  },
  TEAM_PHOTO: {
    kind: 'TEAM_PHOTO',
    label: "Jamoa a'zosi rasmi",
    description: "Bizning jamoa bo'limidagi kvadrat portret (1:1)",
    aspectRatio: 1,
    width1x: 400,
    height1x: 400,
    width2x: 800,
    height2x: 800,
    minWidth: 240,
    maxFileSizeMb: 1,
    allowedFormats: ['jpeg', 'png', 'webp'],
  },
  GALLERY_IMAGE: {
    kind: 'GALLERY_IMAGE',
    label: 'Media galereya rasmi',
    description: "Media galereya bo'limidagi fotolavha (4:3)",
    aspectRatio: 4 / 3,
    width1x: 800,
    height1x: 600,
    width2x: 1600,
    height2x: 1200,
    minWidth: 480,
    maxFileSizeMb: 2,
    allowedFormats: ['jpeg', 'png', 'webp'],
  },
  PROMO_BANNER: {
    kind: 'PROMO_BANNER',
    label: 'Bosh sahifa promo karta foni',
    description: '"Bekobod — imkoniyatlar shahri" kartasining fon rasmi (4:3)',
    // Karta balandligi konteynerga qarab cho'ziladi va rasm `cover` bilan qirqiladi,
    // shuning uchun aniq nisbat muhim emas — 4:3 amaliy o'rtacha qiymat sifatida olindi.
    aspectRatio: 4 / 3,
    width1x: 800,
    height1x: 600,
    width2x: 1600,
    height2x: 1200,
    minWidth: 480,
    maxFileSizeMb: 2,
    allowedFormats: ['jpeg', 'png', 'webp'],
  },
  PARTNER_LOGO: {
    kind: 'PARTNER_LOGO',
    label: 'Hamkor tashkilot logotipi',
    description: "\"Hamkorlik\" sahifasidagi logotip — fon shaffof (2:1)",
    aspectRatio: 2,
    width1x: 240,
    height1x: 120,
    width2x: 480,
    height2x: 240,
    minWidth: 160,
    maxFileSizeMb: 0.5,
    allowedFormats: ['png', 'webp'],
  },
};

export const MEDIA_KINDS = Object.keys(IMAGE_SPECS) as MediaKind[];

export function isValidMediaKind(value: string): value is MediaKind {
  return (MEDIA_KINDS as string[]).includes(value);
}
