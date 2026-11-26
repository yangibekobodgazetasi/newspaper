import { prisma } from '../lib/prisma';
import { NotFoundError } from '../middleware/errorHandler';
import { pickTranslation } from './translation';

interface StaticContentTranslationRow {
  locale: string;
  data: unknown;
}

/**
 * `StaticContentTranslation`dan `key` bo'yicha kerakli tildagi `data`ni oladi
 * (topilmasa standart tilga tushadi). `about.routes.ts` va `contact.routes.ts`
 * ikkalasi ham shu funksiyani ishlatadi — DRY.
 */
export async function getStaticContentData(
  key: string,
  locale: string,
  defaultLocale: string
): Promise<unknown> {
  const rows: StaticContentTranslationRow[] = await prisma.staticContentTranslation.findMany({ where: { key } });

  const translation = pickTranslation<StaticContentTranslationRow>(rows, locale, defaultLocale);
  if (!translation) {
    throw new NotFoundError(`Kontent topilmadi: ${key}`);
  }

  return translation.data;
}
