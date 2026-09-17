/**
 * BIR MARTALIK MIGRATSIYA: FaqItem.question/answer  ->  FaqItemTranslation
 * =======================================================================
 * TTBS (tez-tez beriladigan savollar) yagona tilda saqlanardi. Endi u loyihadagi
 * boshqa kontent bilan bir xil naqshga o'tkazildi (News/TeamMember/NewsCategory kabi).
 *
 * Skript IDEMPOTENT: bir necha marta ishga tushirish xavfsiz, mavjud tarjimalarni
 * qayta yozmaydi. `seed.ts` dan farqli — hech narsani O'CHIRMAYDI.
 *
 * Ishga tushirish:  npx ts-node prisma/backfill-faq-translations.ts
 *
 * Tartib: bazaga yangi `FaqItemTranslation` jadvali qo'shilgach (prisma db push),
 * shu skript ishlatiladi, keyin `FaqItem.question/answer` ustunlari olib tashlanadi.
 * Ustunlar allaqachon o'chirilgan bazada skript baribir ishlaydi — eski matnni
 * o'qishni o'tkazib yuborib, faqat seed'dagi tarjimalarni qo'shadi.
 */
import { PrismaClient } from '@prisma/client';
import servicesSeed from './seed-data/services.json';

const prisma = new PrismaClient();

interface FaqSeedItem {
  order: number;
  translations: Record<string, { question: string; answer: string }>;
}

interface LegacyFaqRow {
  id: string;
  question: string | null;
  answer: string | null;
}

/**
 * Eski ustunlarni o'qiydi. Ular schema'dan olib tashlangani uchun Prisma Client
 * ularni bilmaydi — shuning uchun xom SQL. Ustunlar mavjud bo'lmagan bazada
 * so'rov xato beradi; bu kutilgan holat, `null` qaytariladi.
 */
async function readLegacyRows(): Promise<Map<string, LegacyFaqRow> | null> {
  try {
    const rows = await prisma.$queryRaw<LegacyFaqRow[]>`
      SELECT "id", "question", "answer" FROM "FaqItem"
    `;
    return new Map(rows.map((r) => [r.id, r]));
  } catch {
    console.log('  → eski question/answer ustunlari topilmadi (allaqachon olib tashlangan)');
    return null;
  }
}

async function main() {
  const seedFaq = (servicesSeed as { faq: FaqSeedItem[] }).faq;

  // Standart til — mavjud (tarjimasiz) matn shu tilga tegishli deb hisoblanadi.
  const defaultLang = await prisma.language.findFirst({ where: { isDefault: true } });
  const defaultLocale = defaultLang?.code ?? 'uz';

  const legacy = await readLegacyRows();
  const items = await prisma.faqItem.findMany({
    orderBy: { order: 'asc' },
    include: { translations: true },
  });

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const legacyRow = legacy?.get(item.id);

    // 1) Mavjud ustunlardagi matnni standart til tarjimasiga ko'chiramiz.
    if (legacyRow?.question && legacyRow.answer) {
      if (item.translations.some((t) => t.locale === defaultLocale)) {
        skipped++;
      } else {
        await prisma.faqItemTranslation.create({
          data: {
            faqId: item.id,
            locale: defaultLocale,
            question: legacyRow.question,
            answer: legacyRow.answer,
          },
        });
        created++;
      }
    }

    // 2) Seed'dagi qolgan tillarni qo'shamiz. Moslashtirish standart tildagi savol
    //    matni bo'yicha — ID'lar seed'da saqlanmagan, matn esa barqaror kalit.
    const key =
      legacyRow?.question ?? item.translations.find((t) => t.locale === defaultLocale)?.question;
    const seedItem = seedFaq.find((f) => f.translations[defaultLocale]?.question === key);
    if (!seedItem) {
      console.warn(`  ! "${key ?? item.id}" uchun seed'da tarjima topilmadi — o'tkazib yuborildi`);
      continue;
    }

    for (const [locale, text] of Object.entries(seedItem.translations)) {
      if (locale === defaultLocale) continue;
      if (item.translations.some((t) => t.locale === locale)) {
        skipped++;
        continue;
      }
      await prisma.faqItemTranslation.create({
        data: { faqId: item.id, locale, question: text.question, answer: text.answer },
      });
      created++;
    }
  }

  console.log(`✅ TTBS tarjimalari: ${created} ta yaratildi, ${skipped} ta allaqachon mavjud edi`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
