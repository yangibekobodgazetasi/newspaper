import { defineRouting } from 'next-intl/routing';

/**
 * Yangi til qo'shish uchun bu yerga kod qatorini qo'shish kifoya
 * (masalan "kz", "tr", "ar") — backend Language jadvali va bu ro'yxat
 * mustaqil boshqariladi, lekin frontend routing shu ro'yxatga qarab ishlaydi.
 */
export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
