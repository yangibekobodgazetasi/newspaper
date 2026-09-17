/**
 * RBAC — YAGONA MANBA (backend tomoni)
 * ====================================
 * Ilgari huquqlar `STAFF_ROLES` / `MODERATOR_ROLES` / `PUBLISHER_ROLES` kabi rol
 * massivlari ko'rinishida edi va har bir route faylida takrorlanardi. Yangi bo'lim
 * qo'shilganda qaysi rolga nima ruxsat etilganini butun kod bo'ylab qidirish kerak
 * bo'lardi. Endi huquqlar SHU FAYLDA, `resurs:amal` ko'rinishidagi nomlar bilan
 * belgilanadi; route'lar faqat kerakli huquq nomini aytadi.
 *
 * Admin paneldagi `admin/lib/permissions.ts` ayni shu matritsani takrorlaydi —
 * ikkalasi bir-biriga MOS bo'lishi shart. Admin tomoni faqat KO'RINISH uchun
 * (sidebar/sahifa), haqiqiy himoya esa doim shu yerda, serverda amalga oshadi.
 */

// ---- Rollar ----

/** Tizimda amalda ishlatiladigan rollar. */
export const ACTIVE_ADMIN_ROLES = ['SUPER_ADMIN', 'BOSH_MUHARRIR', 'MUXBIR'] as const;
export type ActiveAdminRole = (typeof ACTIVE_ADMIN_ROLES)[number];

/**
 * Eskirgan rollar. Prisma `AdminRole` enumida ATAYLAB qoldirilgan: enum qiymatini
 * o'chirish Postgresda tur qayta yaratishni talab qiladi va bu jonli bazada
 * keraksiz xavf. Bu qiymatlar endi hech qayerda BERILMAYDI (user API'si faqat
 * `ACTIVE_ADMIN_ROLES`ni qabul qiladi), mavjud yozuv topilsa esa `normalizeRole`
 * uni eng kam huquqli rolga tushiradi — "deprecated" holat xavfsiz tomonga qaraydi.
 */
export const DEPRECATED_ADMIN_ROLES = ['DIZAYNER', 'MODERATOR'] as const;
export type DeprecatedAdminRole = (typeof DEPRECATED_ADMIN_ROLES)[number];

export function isDeprecatedRole(role: string): role is DeprecatedAdminRole {
  return (DEPRECATED_ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * Har qanday saqlangan/tokendagi rol qiymatini amaldagi rolga keltiradi.
 * Noma'lum yoki eskirgan qiymat → MUXBIR (eng kam huquq). Ya'ni eski rolli
 * foydalanuvchi tizimga kira oladi, lekin avtomatik ravishda kengaytirilgan
 * huquq OLMAYDI — SUPER_ADMIN unga yangi rol tayinlashi kerak.
 */
export function normalizeRole(role: string | undefined | null): ActiveAdminRole {
  return (ACTIVE_ADMIN_ROLES as readonly string[]).includes(role ?? '')
    ? (role as ActiveAdminRole)
    : 'MUXBIR';
}

// ---- Huquqlar ----

export const PERMISSIONS = [
  'dashboard:view',
  'settings:view',

  // Yangiliklar. `news:edit.any` — BOSHQA foydalanuvchining yangiligini tahrirlash/
  // o'chirish huquqi. Bu huquqsiz rol faqat o'z yozuvlarini boshqaradi
  // (bkl. utils/ownership.ts).
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

  // Statik kontent: bosh sahifa, biz haqimizda, aloqalar, xizmatlar
  'content:view',
  'content:manage',

  'surveys:view',
  'surveys:manage',

  'forum:moderate',
  'questions:moderate',

  'subscribers:view',
  'subscribers:manage',

  // Tillar RO'YXATINI o'qish har qanday kontent muharririga kerak: ko'p tilli
  // formalar (yangilik, toifa, TTBS...) til tablarini shu ro'yxatdan quradi.
  // BOSHQARISH (qo'shish/o'chirish/standart qilish) esa butun sayt tuzilishiga
  // ta'sir qiladi — u faqat SUPER_ADMIN'da qoladi.
  'languages:view',

  // Tizim darajasidagi sozlamalar — faqat SUPER_ADMIN
  'languages:manage',
  'users:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** BOSH_MUHARRIR: tizim/xavfsizlik (users, languages) dan tashqari barcha muharrirlik ishlari. */
const EDITOR_IN_CHIEF_PERMISSIONS: Permission[] = PERMISSIONS.filter(
  (p) => p !== 'users:manage' && p !== 'languages:manage'
);

/**
 * MUXBIR: yangilik yaratish, o'z yozuvlarini tahrirlash, rasm yuklash, dashboard.
 * `categories:view` va `media:view` ATAYLAB berilgan — ularsiz yangilik formasi
 * (rukn tanlash, rasm tanlash) umuman ishlamaydi. Boshqarish huquqi berilmagan.
 */
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

export const ROLE_PERMISSIONS: Record<ActiveAdminRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  BOSH_MUHARRIR: EDITOR_IN_CHIEF_PERMISSIONS,
  MUXBIR: REPORTER_PERMISSIONS,
};

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}
