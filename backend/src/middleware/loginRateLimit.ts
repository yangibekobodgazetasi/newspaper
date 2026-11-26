import type { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
}

const WINDOW_MS = Number(process.env.LOGIN_LOCKOUT_WINDOW_MS) || 15 * 60 * 1000; // 15 daqiqa
const MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;

// Oddiy in-memory store — joriy deploy bitta Node process sifatida ishlaydi (gorizontal
// scaling yo'q). Agar kelajakda bir nechta instance orqasida load-balance qilinsa, bu yerni
// Redis kabi umumiy store bilan almashtirish kerak bo'ladi (aks holda har instance o'z holatini
// alohida saqlaydi va limit amalda kuchsizlanadi).
const attempts = new Map<string, AttemptRecord>();

function msRemainingIfLocked(key: string): number | null {
  const record = attempts.get(key);
  if (!record) return null;

  const elapsed = Date.now() - record.firstAttemptAt;
  if (elapsed > WINDOW_MS) {
    attempts.delete(key);
    return null;
  }
  return record.count >= MAX_ATTEMPTS ? WINDOW_MS - elapsed : null;
}

function recordFailedAttempt(key: string) {
  const record = attempts.get(key);
  const now = Date.now();
  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
  } else {
    record.count += 1;
  }
}

// IP kaliti: `app.set('trust proxy', N)` (bkl. app.ts) tufayli `req.ip` mijozning haqiqiy
// manzilini anglatadi, mijoz o'zi yuborgan soxta `X-Forwarded-For` qatorlariga ishonmaydi.
function ipKey(req: Request) {
  return `ip:${req.ip}`;
}

function accountKey(req: Request) {
  const username = typeof req.body?.username === 'string' ? req.body.username.toLowerCase().trim() : '';
  return `acct:${username}`;
}

/**
 * Login endpoint uchun brute-force himoyasi: IP VA hisob (username) bo'yicha alohida-alohida
 * kuzatiladi — faqat IP asosida cheklash bitta IP'dan ko'p hisobga hujumni to'xtata olsa-da,
 * turli IP'lardan bitta hisobga qilingan hujumni to'xtata olmaydi (va aksincha).
 */
export function loginRateLimitGuard(req: Request, res: Response, next: NextFunction) {
  const ipRemaining = msRemainingIfLocked(ipKey(req));
  const acctRemaining = msRemainingIfLocked(accountKey(req));

  if (ipRemaining !== null || acctRemaining !== null) {
    const minutes = Math.ceil(Math.max(ipRemaining ?? 0, acctRemaining ?? 0) / 60000);
    res.status(429).json({
      message: `Juda ko'p muvaffaqiyatsiz urinish. ${minutes} daqiqadan so'ng qayta urinib ko'ring.`,
    });
    return;
  }

  next();
}

export function loginAttemptFailed(req: Request) {
  recordFailedAttempt(ipKey(req));
  recordFailedAttempt(accountKey(req));
}

export function loginAttemptSucceeded(req: Request) {
  attempts.delete(ipKey(req));
  attempts.delete(accountKey(req));
}
