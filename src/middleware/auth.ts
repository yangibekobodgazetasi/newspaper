import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { hasPermission, normalizeRole, type Permission } from '../types/permissions';

export interface AuthPayload {
  id: string;
  username: string;
  role: string;
  fullName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET .env faylida belgilanmagan');
  }
  return secret;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

/** Har bir /api/admin/* route'i himoyalanadi — Authorization: Bearer <token> talab qilinadi. */
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, "Avtorizatsiya talab qilinadi");
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, getSecret()) as AuthPayload;
    next();
  } catch {
    throw new ApiError(401, "Token yaroqsiz yoki muddati o'tgan");
  }
}

/** Faqat ko'rsatilgan rollarga ruxsat beradi — authGuard'dan KEYIN ishlatiladi. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(normalizeRole(req.user.role))) {
      throw new ApiError(403, "Bu amal uchun huquqingiz yetarli emas");
    }
    next();
  };
}

/** O'qish (GET/HEAD) va yozish (POST/PUT/PATCH/DELETE) uchun alohida huquq talab qilish. */
interface ReadWritePermission {
  read: Permission;
  write: Permission;
}

function isReadRequest(method: string): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
}

/**
 * Huquq asosidagi guard — `authGuard`dan KEYIN ishlatiladi.
 *
 * Bitta huquq berilsa, u barcha metodlarga taalluqli:
 *     router.use(authGuard, requirePermission('users:manage'))
 *
 * `{ read, write }` berilsa, metodga qarab tanlanadi — masalan muxbir ruknlar
 * ro'yxatini KO'RA oladi (yangilik formasi uchun kerak), lekin o'zgartira olmaydi:
 *     router.use(authGuard, requirePermission({ read: 'categories:view', write: 'categories:manage' }))
 */
export function requirePermission(required: Permission | ReadWritePermission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permission =
      typeof required === 'string' ? required : isReadRequest(req.method) ? required.read : required.write;

    if (!hasPermission(req.user?.role, permission)) {
      throw new ApiError(403, "Bu amal uchun huquqingiz yetarli emas");
    }
    next();
  };
}
