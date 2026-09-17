import { PrismaClient } from '@prisma/client';

// Dev rejimida hot-reload paytida bir nechta PrismaClient nusxasi yaratilib
// ketmasligi uchun global obyektga saqlaymiz — standart Next.js/Express namunasi.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
