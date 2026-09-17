import type { NavItem } from '@/types';

/**
 * Sayt navigatsiya tuzilmasi — Ilova.docx reglamentiga mos.
 * Header (dropdown) va Footer (ustunlar) shu massivdan foydalanadi — DRY.
 * `labelKey` — `messages/*.json`dagi `nav.*` namespace'iga ishora qiladi;
 * ko'rsatiladigan matn komponentda `useTranslations('nav')` orqali olinadi.
 */
export const navigation: NavItem[] = [
  {
    labelKey: 'home',
    href: '/',
  },
  {
    labelKey: 'about',
    href: '/gazeta-haqida',
    children: [
      { labelKey: 'aboutOverview', href: '/gazeta-haqida' },
      { labelKey: 'aboutGoals', href: '/gazeta-haqida/maqsad-va-vazifalar' },
      { labelKey: 'aboutPartnership', href: '/gazeta-haqida/hamkorlik' },
      { labelKey: 'aboutAntiCorruption', href: '/gazeta-haqida/korrupsiyaga-qarshi-kurashish' },
    ],
  },
  {
    labelKey: 'issues',
    href: '/sonlar-arxivi',
  },
  {
    labelKey: 'news',
    href: '/yangiliklar',
    children: [
      { labelKey: 'newsDaily', href: '/yangiliklar/kundalik-yangiliklar' },
      { labelKey: 'newsEvents', href: '/yangiliklar/ommaviy-tadbirlar' },
      { labelKey: 'newsLeadership', href: '/yangiliklar/rahbariyat-bayonotlari' },
      { labelKey: 'newsMedia', href: '/yangiliklar/oav-biz-haqimizda' },
      { labelKey: 'newsAnnouncements', href: '/yangiliklar/elonlar' },
      { labelKey: 'newsGallery', href: '/yangiliklar/media-galereya' },
    ],
  },
  {
    labelKey: 'services',
    href: '/xizmatlar',
    children: [
      { labelKey: 'servicesSurvey', href: '/xizmatlar/sorov' },
      { labelKey: 'servicesForum', href: '/xizmatlar/forum' },
      { labelKey: 'servicesQa', href: '/xizmatlar/savol-javob' },
      { labelKey: 'servicesFaq', href: '/xizmatlar/ttbs' },
      { labelKey: 'servicesSubscribe', href: '/xizmatlar/obuna' },
    ],
  },
  {
    labelKey: 'team',
    href: '/jamoa',
  },
  {
    labelKey: 'contact',
    href: '/aloqalar',
    children: [
      { labelKey: 'contactAddress', href: '/aloqalar/manzil' },
      { labelKey: 'contactRequisites', href: '/aloqalar/rekvizitlar' },
      { labelKey: 'contactSchedule', href: '/aloqalar/qabul-jadvali' },
      { labelKey: 'contactBuyers', href: '/aloqalar/xaridorlar-uchun' },
    ],
  },
];
