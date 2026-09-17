import {
  LayoutDashboard, Newspaper, BookImage, Users, FileText, Phone,
  UserCog, MessageSquareText, HelpCircle, Mail, Settings, Star,
  Tags, GalleryHorizontalEnd, Languages, Home, ListChecks, BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { AdminRole } from '@/types';

/**
 * RBAC — YAGONA MANBA (admin paneli tomoni)
 * =========================================
 * Bu fayl `backend/src/types/permissions.ts` ning aynan nusxasi bo'lishi SHART.
 * Ikkalasi ajralib qolsa, sidebar'da ko'rinadigan-u ochilmaydigan bo'lim paydo bo'ladi.
 *
 * MUHIM: bu yerdagi tekshiruvlar faqat KO'RINISH uchun — menyuni filtrlash va 403
 * sahifasini ko'rsatish. Haqiqiy himoya HAR DOIM serverda: URL'ni qo'lda yozib
 * kirgan yoki to'g'ridan-to'g'ri API'ga murojaat qilgan foydalanuvchini backend
 * `requirePermission` orqali to'xtatadi. Bu yerda biror narsani yashirish
 * xavfsizlik chorasi HISOBLANMAYDI.
 */

export const ACTIVE_ADMIN_ROLES: AdminRole[] = ['SUPER_ADMIN', 'BOSH_MUHARRIR', 'MUXBIR'];

/** Eskirgan rollar — yangi foydalanuvchiga tayinlanmaydi (bkl. backend permissions.ts). */
export const DEPRECATED_ADMIN_ROLES: AdminRole[] = ['DIZAYNER', 'MODERATOR'];

export const PERMISSIONS = [
  'dashboard:view',
  'settings:view',
  'news:view',
  'news:create',
  'news:edit.any',
  'news:feature',
  'categories:view',
  'categories:manage',
  'issues:view',
  'issues:manage',
  'gallery:view',
  'gallery:manage',
  'media:view',
  'media:upload',
  'media:delete',
  'faq:view',
  'faq:manage',
  'team:view',
  'team:manage',
  'content:view',
  'content:manage',
  'surveys:view',
  'surveys:manage',
  'forum:moderate',
  'questions:moderate',
  'subscribers:view',
  'subscribers:manage',
  'languages:view',
  'languages:manage',
  'users:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const EDITOR_IN_CHIEF_PERMISSIONS: Permission[] = PERMISSIONS.filter(
  (p) => p !== 'users:manage' && p !== 'languages:manage'
);

const REPORTER_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'settings:view',
  'news:view',
  'news:create',
  'categories:view',
  'languages:view',
  'media:view',
  'media:upload',
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  BOSH_MUHARRIR: EDITOR_IN_CHIEF_PERMISSIONS,
  MUXBIR: REPORTER_PERMISSIONS,
};

/** Noma'lum/eskirgan rol → eng kam huquq (backenddagi `normalizeRole` bilan bir xil). */
export function normalizeRole(role: string | undefined | null): AdminRole {
  return ACTIVE_ADMIN_ROLES.includes(role as AdminRole) ? (role as AdminRole) : 'MUXBIR';
}

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  BOSH_MUHARRIR: 'Bosh muharrir',
  MUXBIR: 'Muxbir',
  // Eskirgan — faqat mavjud yozuvni ko'rsatish uchun qoldirilgan
  DIZAYNER: 'Dizayner (eskirgan)',
  MODERATOR: 'Moderator (eskirgan)',
};

/** Rol tanlashda ko'rsatiladigan qisqa izoh — kimga qaysi rol berilishini tushunarli qiladi. */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: "To'liq huquq: barcha bo'limlar, foydalanuvchilar, rollar va tizim sozlamalari.",
  BOSH_MUHARRIR:
    "Barcha tahririyat ishlari: yangiliklar, ruknlar, sonlar, galereya, so'rovlar, murojaatlar va sahifa matnlari. Foydalanuvchilar va tizim sozlamalariga kira olmaydi.",
  MUXBIR:
    "Yangilik yaratish va O'ZI yaratgan yangiliklarni tahrirlash, rasm yuklash. Boshqalarning yangiliklariga, ruknlarga, sonlarga va sozlamalarga kira olmaydi.",
};

// ---- Menyu / route konfiguratsiyasi ----

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
}

/**
 * Sidebar VA sahifa guard'lari uchun yagona ro'yxat. Yangi bo'lim qo'shilganda
 * shu yerga bitta qator qo'shiladi — menyu ham, ruxsat ham avtomatik to'g'ri bo'ladi.
 * Har bir `permission` backenddagi mos route'ning huquqi bilan bir xil.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  { href: '/news/featured', label: 'Bosh materiallar', icon: Star, permission: 'news:feature' },
  { href: '/content/home', label: 'Bosh sahifa', icon: Home, permission: 'content:view' },
  { href: '/news', label: 'Yangiliklar', icon: Newspaper, permission: 'news:view' },
  { href: '/categories', label: 'Toifalar', icon: Tags, permission: 'categories:manage' },
  { href: '/issues', label: 'Sonlar arxivi', icon: BookImage, permission: 'issues:view' },
  { href: '/gallery', label: 'Media galereya', icon: GalleryHorizontalEnd, permission: 'gallery:view' },
  { href: '/content/about', label: 'Biz haqimizda', icon: FileText, permission: 'content:view' },
  { href: '/content/contact', label: 'Aloqalar', icon: Phone, permission: 'content:view' },
  { href: '/surveys', label: "So'rovlar", icon: BarChart3, permission: 'surveys:view' },
  { href: '/forum', label: 'Forum moderatsiyasi', icon: MessageSquareText, permission: 'forum:moderate' },
  { href: '/questions', label: 'Savol-javob', icon: HelpCircle, permission: 'questions:moderate' },
  { href: '/faq', label: 'TTBS', icon: ListChecks, permission: 'faq:view' },
  { href: '/subscribers', label: 'Obunachilar', icon: Mail, permission: 'subscribers:view' },
  { href: '/team', label: 'Jamoa', icon: Users, permission: 'team:view' },
  { href: '/languages', label: 'Tillar', icon: Languages, permission: 'languages:manage' },
  { href: '/users', label: 'Foydalanuvchilar ', icon: UserCog, permission: 'users:manage' },
  { href: '/settings', label: 'Sozlamalar', icon: Settings, permission: 'settings:view' },
];

export function visibleNavItems(role: string | undefined | null): NavItem[] {
  return NAV_ITEMS.filter((item) => hasPermission(role, item.permission));
}
