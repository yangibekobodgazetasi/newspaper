import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import newsSeed from './seed-data/news.json';
import issuesSeed from './seed-data/issues.json';
import mediaSeed from './seed-data/media.json';
import teamSeed from './seed-data/team.json';
import aboutSeed from './seed-data/about.json';
import contactSeed from './seed-data/contact.json';
import servicesSeed from './seed-data/services.json';

const prisma = new PrismaClient();

// Seed ma'lumotlari hozircha faqat o'zbekcha (locale="uz") — ru/en tarjimalari
// admin panel orqali (yoki keyinchalik AI-tarjima tugmasi bilan) qo'shiladi.
const DEFAULT_LOCALE = 'uz';

interface NewsSeedItem {
  id: string;
  slug: string;
  rubric: string; // endi ishlatilmaydi — ko'rsatiladigan nom NewsCategoryTranslation'dan olinadi
  rubricSlug: string;
  title: string;
  excerpt: string;
  body?: string;
  author: string;
  publishedAt: string;
  cover: string;
  featured?: boolean;
}

interface IssueSeedItem {
  id: string;
  number: number;
  date: string;
  pages: number;
  fileSize: string;
  pdfUrl: string;
}

interface MediaSeedItem {
  id: string;
  cover: string;
  caption: string;
  publishedAt: string;
}

interface TeamSeedItem {
  id: string;
  name: string;
  role: string;
  photo: string | null;
}

async function seedLanguages() {
  const languages = [
    { code: 'uz', name: "O'zbekcha", isDefault: true, order: 0 },
    { code: 'ru', name: 'Русский', isDefault: false, order: 1 },
    { code: 'en', name: 'English', isDefault: false, order: 2 },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      create: lang,
      update: { name: lang.name, order: lang.order }, // isDefault/isActive admin panelda boshqariladi, qayta yozilmaydi
    });
  }
  console.log(`  → ${languages.length} ta til (uz — standart)`);
}

async function seedNewsCategories() {
  await prisma.newsCategoryTranslation.deleteMany();
  await prisma.newsCategory.deleteMany({ where: { isSystem: true } });

  const categories = [
    {
      slug: 'kundalik-yangiliklar',
      label: 'Kundalik yangiliklar',
      description: "Tumanning kundalik hayotidan so'nggi yangiliklar",
    },
    {
      slug: 'ommaviy-tadbirlar',
      label: 'Ommaviy tadbirlar',
      description: "O'tkazilgan yig'in, bayram va tantanali tadbirlar haqida",
    },
    {
      slug: 'rahbariyat-bayonotlari',
      label: 'Rahbariyatning chiqishlari va bayonotlari',
      description: 'Boshqaruv organi vakillarining rasmiy chiqishlari',
    },
    {
      slug: 'oav-biz-haqimizda',
      label: 'OAV biz haqimizda',
      description: "\"Yangi Bekobod\" DM faoliyati boshqa OAVlar tilidan",
    },
    {
      slug: 'elonlar',
      label: "E'lonlar",
      description: "Muassasaga kelib tushgan rasmiy e'lonlar",
    },
    {
      slug: 'media-galereya',
      label: 'Media galereya',
      description: 'Tuman hayotidan fotolavhalar',
    },
  ];

  for (const [index, category] of categories.entries()) {
    await prisma.newsCategory.create({
      data: {
        slug: category.slug,
        isSystem: true,
        order: index,
        translations: {
          create: { locale: DEFAULT_LOCALE, label: category.label, description: category.description },
        },
      },
    });
  }
  console.log(`  → ${categories.length} ta tizim toifasi (${DEFAULT_LOCALE} tarjimasi bilan)`);
}

async function seedNews() {
  await prisma.newsTranslation.deleteMany();
  await prisma.news.deleteMany();
  const items = newsSeed as NewsSeedItem[];

  for (const item of items) {
    await prisma.news.create({
      data: {
        categorySlug: item.rubricSlug,
        author: item.author,
        publishedAt: new Date(item.publishedAt),
        cover: item.cover,
        featured: item.featured ?? false,
        translations: {
          create: {
            locale: DEFAULT_LOCALE,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            body: item.body,
          },
        },
      },
    });
  }
  console.log(`  → ${items.length} ta yangilik (${DEFAULT_LOCALE} tarjimasi bilan)`);
}

async function seedIssues() {
  await prisma.issue.deleteMany();
  const items = issuesSeed as IssueSeedItem[];

  for (const issue of items) {
    await prisma.issue.create({
      data: {
        id: issue.id,
        number: issue.number,
        date: new Date(issue.date),
        pages: issue.pages,
        fileSize: issue.fileSize,
        pdfUrl: issue.pdfUrl,
      },
    });
  }
  console.log(`  → ${items.length} ta son`);
}

async function seedMedia() {
  await prisma.mediaItem.deleteMany();
  const items = mediaSeed as MediaSeedItem[];

  await prisma.mediaItem.createMany({
    data: items.map((item) => ({
      cover: item.cover,
      caption: item.caption,
      publishedAt: new Date(item.publishedAt),
    })),
  });
  console.log(`  → ${items.length} ta media`);
}

async function seedTeam() {
  await prisma.teamMemberTranslation.deleteMany();
  await prisma.teamMember.deleteMany();
  const items = teamSeed as TeamSeedItem[];

  for (const [index, member] of items.entries()) {
    await prisma.teamMember.create({
      data: {
        name: member.name, // tarjima qilinmaydi
        photo: member.photo,
        order: index,
        translations: {
          create: { locale: DEFAULT_LOCALE, role: member.role },
        },
      },
    });
  }
  console.log(`  → ${items.length} ta jamoa a'zosi (${DEFAULT_LOCALE} tarjimasi bilan)`);
}

async function seedAboutAndContact() {
  await prisma.staticContentTranslation.deleteMany();

  const aboutEntries = Object.entries(aboutSeed as Record<string, unknown>).map(([slug, data]) => ({
    key: `about:${slug}`,
    data: data as object,
  }));

  const contact = contactSeed as {
    manzil: object;
    rekvizitlar: object;
    qabulJadvali: object;
    xaridorlarUchun: object;
  };

  const contactEntries = [
    { key: 'contact:manzil', data: contact.manzil },
    { key: 'contact:rekvizitlar', data: contact.rekvizitlar },
    { key: 'contact:qabul-jadvali', data: { schedule: contact.qabulJadvali } },
    { key: 'contact:xaridorlar-uchun', data: contact.xaridorlarUchun },
  ];

  // Bosh sahifadagi promo kartasi — admin panelda to'ldiriladi. Bo'sh qiymatlar bilan
  // yaratiladi, shunda frontend standart ko'rinishini (tarjima matni + gradient fon)
  // saqlaydi, admin esa tayyor yozuvni ochib tahrirlaydi.
  const homeEntries = [{ key: 'home:promo', data: { heading: null, image: null } }];

  for (const entry of [...aboutEntries, ...contactEntries, ...homeEntries]) {
    await prisma.staticContentTranslation.create({
      data: { key: entry.key, locale: DEFAULT_LOCALE, data: entry.data as object },
    });
  }
  console.log(
    `  → ${aboutEntries.length + contactEntries.length + homeEntries.length} ta statik sahifa (${DEFAULT_LOCALE} tarjimasi bilan)`
  );
}

async function seedServices() {
  await prisma.surveyOption.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.forumTopic.deleteMany();
  await prisma.questionAnswer.deleteMany();
  await prisma.faqItem.deleteMany();

  const services = servicesSeed as {
    survey: { question: string; isActive: boolean; options: { label: string; votes: number }[] };
    forumTopics: { title: string; body: string; authorName: string; createdAt: string; replyCount: number }[];
    questions: { question: string; answer: string | null; askedBy: string; status: string; createdAt: string }[];
    faq: { order: number; translations: Record<string, { question: string; answer: string }> }[];
  };

  await prisma.survey.create({
    data: {
      question: services.survey.question,
      isActive: services.survey.isActive,
      options: { create: services.survey.options.map((o) => ({ label: o.label, votes: o.votes })) },
    },
  });

  for (const topic of services.forumTopics) {
    await prisma.forumTopic.create({
      data: {
        title: topic.title,
        body: topic.body,
        authorName: topic.authorName,
        replyCount: topic.replyCount,
        createdAt: new Date(topic.createdAt),
      },
    });
  }

  for (const q of services.questions) {
    await prisma.questionAnswer.create({
      data: {
        question: q.question,
        answer: q.answer,
        askedBy: q.askedBy,
        status: q.status,
        createdAt: new Date(q.createdAt),
      },
    });
  }

  // TTBS — savol/javob matni FaqItemTranslation'da (boshqa kontent bilan bir xil naqsh).
  // Seed'dagi barcha tillar birdaniga yaratiladi.
  for (const f of services.faq) {
    await prisma.faqItem.create({
      data: {
        order: f.order,
        translations: {
          create: Object.entries(f.translations).map(([locale, text]) => ({
            locale,
            question: text.question,
            answer: text.answer,
          })),
        },
      },
    });
  }

  console.log('  → so\'rov, forum, savol-javob, TTBS');
}

async function seedAdminUser() {
  const username = 'admin';
  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) {
    console.log('  → super admin allaqachon mavjud, o\'tkazib yuborildi');
    return;
  }

  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.adminUser.create({
    data: {
      fullName: 'Bosh administrator',
      username,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`  → super admin yaratildi (${username} / ChangeMe123! — birinchi kirishdan so'ng almashtiring!)`);
}

async function main() {
  console.log("🌱 Ma'lumotlar bazasi to'ldirilmoqda...");
  await seedLanguages();
  await seedNewsCategories();
  await seedNews();
  await seedIssues();
  await seedMedia();
  await seedTeam();
  await seedAboutAndContact();
  await seedServices();
  await seedAdminUser();
  console.log('✅ Seed muvaffaqiyatli yakunlandi');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
