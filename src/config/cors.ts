import type { CorsOptions } from 'cors';

/**
 * Production domenlari qattiq kodlangan (sayt bitta domenda ishlaydi), lekin
 * `CORS_ORIGINS` (vergul bilan ajratilgan) orqali qo'shimcha manzil qo'shish
 * mumkin — masalan domen o'zgarganda kodni tegmasdan .env orqali.
 */
const DEFAULT_ORIGINS = [
  'https://yangibekobod.uz',
  'https://www.yangibekobod.uz',
  'https://admin.yangibekobod.uz',
];

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

const extraOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...DEFAULT_ORIGINS,
  ...(process.env.NODE_ENV === 'production' ? [] : DEV_ORIGINS),
  ...extraOrigins,
]);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // `origin` server-serverga so'rovlarda (curl, health-check, mobil ilova)
    // yo'q bo'ladi — brauzer emasligi sababli SOP/CORS ularga umuman tegishli emas.
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: "${origin}" manziliga ruxsat yo'q`));
  },
};
