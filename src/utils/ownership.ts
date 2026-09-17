/**
 * RESURS EGALIGI (IDOR himoyasi)
 * ==============================
 * Rol tekshiruvi yolg'iz o'zi yetarli emas: ikkita muxbirning ikkalasi ham
 * `news:create` huquqiga ega, lekin biri ikkinchisining yangiligini URL'dagi ID'ni
 * almashtirib tahrirlay/o'chira olmasligi kerak. Shuning uchun rol tekshiruvidan
 * TASHQARI, mutatsiyadan oldin yozuvning egasi ham tekshiriladi.
 */
import { ApiError } from '../middleware/errorHandler';
import { hasPermission } from '../types/permissions';
import type { AuthPayload } from '../middleware/auth';

/**
 * Foydalanuvchi shu yozuvni o'zgartira oladimi?
 *
 * @param anyPermission - "boshqalarnikini ham" huquqi (masalan `news:edit.any`)
 * @param ownerId - yozuv egasining id'si; `null` bo'lsa (eski, egasi belgilanmagan
 *   yozuvlar) faqat `anyPermission` egalari tegishi mumkin — egasiz yozuvni
 *   hammaga ochib qo'ymaslik uchun.
 */
export function assertCanMutate(
  user: AuthPayload | undefined,
  anyPermission: Parameters<typeof hasPermission>[1],
  ownerId: string | null | undefined
): void {
  if (hasPermission(user?.role, anyPermission)) return;
  if (ownerId && user?.id === ownerId) return;

  throw new ApiError(403, "Bu yozuv sizga tegishli emas — faqat o'zingiz yaratgan yozuvlarni tahrirlay olasiz");
}

/**
 * Ro'yxat/ko'rish uchun filtr: "boshqalarnikini ham" huquqi bo'lmasa, faqat o'z
 * yozuvlari qaytariladi. Prisma `where` obyektiga qo'shiladi.
 */
export function ownershipFilter(
  user: AuthPayload | undefined,
  anyPermission: Parameters<typeof hasPermission>[1],
  ownerField: string
): Record<string, string> {
  if (hasPermission(user?.role, anyPermission)) return {};
  // Egasi yo'q (`null`) yozuvlar ham ro'yxatga tushmaydi — ular boshqalarniki.
  return { [ownerField]: user?.id ?? '__no_user__' };
}
