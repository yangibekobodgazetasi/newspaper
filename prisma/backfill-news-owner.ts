/**
 * ESKI YANGILIKLARGA EGA BELGILASH
 * ================================
 * `News.authorId` maydoni keyinroq qo'shilgani uchun undan OLDIN kiritilgan
 * yozuvlarda u `null` bo'lib qoldi. Egasi yo'q yozuvni faqat `news:edit.any`
 * huquqiga ega rol tahrirlay oladi (bkl. src/utils/ownership.ts) — ya'ni ular
 * ma'lumot modelida "osilib" turadi.
 *
 * MUHIM FARQ:
 *   `author`   — MAQOLA MUALLIFI (jurnalist ismi), saytda chop etiladi.
 *                Masalan "Sarvinoz SHERALIYEVA". Bu odamlarning admin hisobi yo'q.
 *   `authorId` — yozuvni TIZIMGA KIRITGAN admin. Huquq tekshiruvi shunga qaraydi.
 * Shuning uchun `author` matnini admin hisobiga moslashtirishga urinilmaydi —
 * ular boshqa-boshqa narsa.
 *
 * Skript egasiz yozuvlarni yagona mavjud SUPER_ADMIN hisobiga biriktiradi
 * (amalda o'sha hisob orqali kiritilgan). `author` matni TEGILMAYDI — saytda
 * jurnalist ismi o'zgarmaydi.
 *
 * Ishga tushirish (avval nima o'zgarishini ko'rish uchun):
 *   npx ts-node prisma/backfill-news-owner.ts
 * Haqiqatan yozish uchun:
 *   npx ts-node prisma/backfill-news-owner.ts --apply
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const apply = process.argv.includes('--apply');

  const orphans = await prisma.news.findMany({
    where: { authorId: null },
    include: { translations: { where: { locale: 'uz' }, select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (orphans.length === 0) {
    console.log("✅ Egasi belgilanmagan yangilik yo'q — hammasi joyida");
    return;
  }

  // Faqat SUPER_ADMIN egalik qila oladi: bu yozuvlar admin panel orqali kiritilgan.
  const owners = await prisma.adminUser.findMany({
    where: { role: 'SUPER_ADMIN', isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (owners.length === 0) {
    console.error("❌ Faol SUPER_ADMIN topilmadi — ega tayinlab bo'lmaydi");
    process.exitCode = 1;
    return;
  }
  if (owners.length > 1) {
    // Bir nechta bo'lsa TAXMIN QILMAYMIZ — qaysi biri ekanini odam hal qilsin.
    console.error(`❌ ${owners.length} ta SUPER_ADMIN bor, qaysi biri ega ekani noma'lum:`);
    owners.forEach((o) => console.error(`     ${o.username} (${o.fullName})`));
    console.error('   Skriptni qo\'lda moslang yoki egalikni admin panelidan belgilang.');
    process.exitCode = 1;
    return;
  }

  const owner = owners[0];
  console.log(`${orphans.length} ta yangilikning egasi belgilanmagan.`);
  console.log(`Ega sifatida tayinlanadi: ${owner.username} (${owner.fullName})\n`);

  for (const n of orphans) {
    const title = n.translations[0]?.title ?? n.id;
    console.log(`  ${apply ? '✔' : '•'} ${title.slice(0, 58).padEnd(58)} muallif: ${n.author}`);
  }

  if (!apply) {
    console.log('\nHech narsa o\'zgartirilmadi. Yozish uchun: --apply');
    return;
  }

  // `authorId: null` sharti muhim — egasi allaqachon bor yozuvlar TEGILMAYDI.
  const result = await prisma.news.updateMany({
    where: { authorId: null },
    data: { authorId: owner.id },
  });

  console.log(`\n✅ ${result.count} ta yangilikka ega belgilandi (\`author\` matni o'zgarmadi)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
