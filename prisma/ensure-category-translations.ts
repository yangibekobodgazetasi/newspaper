/**
 * TIZIM TOIFALARINING TARJIMALARINI TIKLASH (xavfsiz, idempotent)
 * ================================================================
 * `/api/news/categories` tarjimasi yo'q toifalarni ro'yxatdan chiqarib tashlaydi, frontend esa
 * toifa topilmasa 404 qaytaradi. Toifalarning tarjimasi bazada yo'q bo'lsa (masalan, ma'lumotlar
 * eski sxemadan ko'chirilganda) barcha toifa va yangilik sahifalari 404 bo'lib qoladi.
 *
 * Bu skript `seed.ts` dan farqli HECH NARSANI O'CHIRMAYDI va YANGILAMAYDI:
 *  - mavjud toifa qatoriga tegmaydi, yo'q bo'lsa yaratadi;
 *  - mavjud tarjimani qayta yozmaydi, faqat yetishmayotganini qo'shadi.
 * Admin panelda qo'lda tahrirlangan matnlar saqlanib qoladi.
 *
 * Ishga tushirish:  npx ts-node prisma/ensure-category-translations.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Texts = Record<string, { label: string; description: string }>;

const SYSTEM_CATEGORIES: { slug: string; texts: Texts }[] = [
  {
    slug: 'kundalik-yangiliklar',
    texts: {
      uz: { label: 'Kundalik yangiliklar', description: "Tumanning kundalik hayotidan so'nggi yangiliklar" },
      ru: { label: 'Ежедневные новости', description: 'Последние новости из повседневной жизни района' },
      en: { label: 'Daily news', description: "Latest news from the district's daily life" },
    },
  },
  {
    slug: 'ommaviy-tadbirlar',
    texts: {
      uz: { label: 'Ommaviy tadbirlar', description: "O'tkazilgan yig'in, bayram va tantanali tadbirlar haqida" },
      ru: { label: 'Массовые мероприятия', description: 'О прошедших собраниях, праздниках и торжественных мероприятиях' },
      en: { label: 'Public events', description: 'About gatherings, celebrations and ceremonial events' },
    },
  },
  {
    slug: 'rahbariyat-bayonotlari',
    texts: {
      uz: { label: 'Rahbariyatning chiqishlari va bayonotlari', description: 'Boshqaruv organi vakillarining rasmiy chiqishlari' },
      ru: { label: 'Выступления и заявления руководства', description: 'Официальные выступления представителей органа управления' },
      en: { label: 'Leadership speeches and statements', description: 'Official speeches by representatives of the governing body' },
    },
  },
  {
    slug: 'oav-biz-haqimizda',
    texts: {
      uz: { label: 'OAV biz haqimizda', description: '"Yangi Bekobod" DM faoliyati boshqa OAVlar tilidan' },
      ru: { label: 'СМИ о нас', description: 'Деятельность ГП «Янги Бекабад» глазами других СМИ' },
      en: { label: 'Media about us', description: 'The work of "Yangi Bekobod" as covered by other media outlets' },
    },
  },
  {
    slug: 'elonlar',
    texts: {
      uz: { label: "E'lonlar", description: "Muassasaga kelib tushgan rasmiy e'lonlar" },
      ru: { label: 'Объявления', description: 'Официальные объявления, поступившие в учреждение' },
      en: { label: 'Announcements', description: 'Official announcements received by the institution' },
    },
  },
  {
    slug: 'media-galereya',
    texts: {
      uz: { label: 'Media galereya', description: 'Tuman hayotidan fotolavhalar' },
      ru: { label: 'Медиагалерея', description: 'Фотоматериалы из жизни района' },
      en: { label: 'Media gallery', description: 'Photo stories from the life of the district' },
    },
  },
];

async function main() {
  const languages = await prisma.language.findMany({ where: { isActive: true } });
  const activeCodes = new Set(languages.map((l) => l.code));
  // Til jadvali bo'sh bo'lsa ham kamida standart til (uz) tarjimasi yaratilsin.
  const locales = ['uz', 'ru', 'en'].filter((code) => code === 'uz' || activeCodes.has(code));

  let createdCategories = 0;
  let createdTranslations = 0;
  let skipped = 0;

  for (const [index, category] of SYSTEM_CATEGORIES.entries()) {
    const existing = await prisma.newsCategory.findUnique({
      where: { slug: category.slug },
      include: { translations: { select: { locale: true } } },
    });

    if (!existing) {
      await prisma.newsCategory.create({ data: { slug: category.slug, isSystem: true, order: index } });
      createdCategories++;
    }

    const have = new Set(existing?.translations.map((t) => t.locale) ?? []);
    for (const locale of locales) {
      if (have.has(locale)) {
        skipped++;
        continue;
      }
      await prisma.newsCategoryTranslation.create({
        data: { categorySlug: category.slug, locale, ...category.texts[locale] },
      });
      createdTranslations++;
    }
  }

  console.log(
    `✅ Toifalar: ${createdCategories} ta yangi toifa, ${createdTranslations} ta tarjima qo'shildi, ${skipped} ta allaqachon mavjud edi`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
