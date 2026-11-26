import type { Request } from 'express';
import { Prisma, type SubmissionKind } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import { getBusinessDayKey } from './businessDay';

/**
 * Ro'yxatdan o'tgan foydalanuvchi hisobi yo'qligi sababli (frontend to'liq anonim), eng yaqin
 * "identity" sifatida brauzerda saqlanadigan `visitorHash` (SiteVisit analytics'da ishlatilgan
 * xuddi shu mavjud pattern) qabul qilinadi. U yuborilmagan bo'lsa IP fallback sifatida olinadi.
 */
function resolveIdentityKey(req: Request, visitorHash?: string): string {
  const trimmed = visitorHash?.trim();
  return trimmed ? `visitor:${trimmed}` : `ip:${req.ip}`;
}

const DAILY_LIMIT_MESSAGES: Record<SubmissionKind, string> = {
  MUROJAAT: "Siz bugun allaqachon murojaat yubordingiz. Ertaga qayta urinib ko'ring.",
  SAVOL: "Siz bugun allaqachon savol yubordingiz. Ertaga qayta urinib ko'ring.",
};

/**
 * Kunlik 1 marta yuborish limitini DATABASE darajasida, race condition'ga chidamli tarzda
 * ta'minlaydi. `create()` chaqiruvi asosiy operatsiya bilan BIR XIL tranzaksiyada bo'lishi kerak —
 * chaqiruvchi shu funksiyani `prisma.$transaction` ichida ishlatadi (bkl. contact.routes.ts,
 * services.routes.ts). Agar shu kun uchun limit allaqachon band bo'lsa (unique constraint,
 * P2002), 429 statusli tushunarli xabar bilan `ApiError` tashlaydi.
 */
export function buildThrottleCreate(kind: SubmissionKind, req: Request, visitorHash?: string) {
  return prisma.submissionThrottle.create({
    data: {
      kind,
      identityKey: resolveIdentityKey(req, visitorHash),
      day: getBusinessDayKey(),
    },
  });
}

export function throwIfThrottleViolation(kind: SubmissionKind, err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    throw new ApiError(429, DAILY_LIMIT_MESSAGES[kind]);
  }
  throw err;
}
