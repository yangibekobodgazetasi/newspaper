/**
 * YETIM RASM YOZUVLARINI TOZALASH
 * ===============================
 * `MediaAsset.kind` qiymati endi qo'llab-quvvatlanmaydigan yozuvlar (masalan olib
 * tashlangan `SITE_LOGO`) admin panelida UMUMAN KO'RINMAYDI — "Rasmlar" bo'limi
 * `MEDIA_KINDS` ro'yxati bo'yicha qurilgan. Ya'ni ular bazada va diskda ko'rinmas
 * axlat sifatida qolib ketadi va odatiy yo'l bilan o'chirib bo'lmaydi.
 *
 * Skript XAVFSIZ: har bir yozuv uchun avval `countAssetUsages` bilan qayerdadir
 * ishlatilmayotgani tekshiriladi. Ishlatilayotgan bo'lsa TEGILMAYDI va sabab
 * yoziladi. Faqat haqiqatan hech qayerda ishlatilmagan yozuv o'chiriladi.
 *
 * Ishga tushirish (avval nima o'chishini ko'rish uchun):
 *   npx ts-node prisma/cleanup-orphan-assets.ts
 * Haqiqatan o'chirish uchun:
 *   npx ts-node prisma/cleanup-orphan-assets.ts --apply
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { MEDIA_KINDS } from '../src/types/imageSpecs';
import { countAssetUsages } from '../src/utils/mediaUsage';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

async function main() {
  const apply = process.argv.includes('--apply');
  const knownKinds = MEDIA_KINDS as string[];

  const assets = await prisma.mediaAsset.findMany();
  const orphans = assets.filter((a) => !knownKinds.includes(a.kind));

  if (orphans.length === 0) {
    console.log("✅ Noma'lum turdagi rasm yozuvi topilmadi — tozalash shart emas");
    return;
  }

  console.log(`${orphans.length} ta noma'lum turdagi yozuv topildi:\n`);

  for (const asset of orphans) {
    const usage = await countAssetUsages(asset.url);

    if (usage.total > 0) {
      console.log(`  ⏭  ${asset.kind} ${asset.url} — ISHLATILMOQDA (${usage.labels.join(', ')}), tegilmadi`);
      continue;
    }

    if (!apply) {
      console.log(`  •  ${asset.kind} ${asset.url} — o'chirishga tayyor`);
      continue;
    }

    // Avval baza yozuvi, keyin fayl — `delete` xato bersa fayl joyida qoladi.
    await prisma.mediaAsset.delete({ where: { id: asset.id } });

    const filePath = path.join(UPLOAD_DIR, asset.url.replace('/uploads/', ''));
    fs.unlink(filePath, () => {});
    console.log(`  ✔  ${asset.kind} ${asset.url} — o'chirildi`);
  }

  if (!apply) {
    console.log("\nHech narsa o'chirilmadi. Haqiqatan o'chirish uchun: --apply");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
