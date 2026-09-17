import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

/**
 * Gazeta soni PDF fayllari bilan ishlash — yuklash route'i, serializer va o'chirish
 * mantig'i shu bitta joydagi yo'l qoidalariga tayanadi (DRY va xavfsizroq).
 */
export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
export const PDF_SUBDIR = 'issues';
export const PDF_URL_PREFIX = `/uploads/${PDF_SUBDIR}/`;

/**
 * `/uploads/issues/xxx.pdf` manzilini diskdagi haqiqiy yo'lga aylantiradi.
 *
 * XAVFSIZLIK: `Issue.pdfUrl` — bazadagi, ya'ni oxir-oqibat mijozdan kelgan satr.
 * Faqat prefiksni tekshirish yetarli emas (`/uploads/issues/../../..` ham prefiksdan
 * o'tadi), shuning uchun `path.resolve` natijasi PDF papkasi ICHIDA ekanligi
 * qat'iy tekshiriladi. Mos kelmasa `null` qaytadi va hech qanday fayl amali bajarilmaydi.
 */
export function resolveIssuePdfPath(pdfUrl: string | null | undefined): string | null {
  if (!pdfUrl || !pdfUrl.startsWith(PDF_URL_PREFIX)) return null;

  const pdfDir = path.resolve(UPLOAD_DIR, PDF_SUBDIR);
  const filePath = path.resolve(UPLOAD_DIR, pdfUrl.replace('/uploads/', ''));

  return filePath.startsWith(pdfDir + path.sep) ? filePath : null;
}

/**
 * PDF haqiqatan diskda bormi.
 *
 * Admin panel orqali YUKLANMAGAN manzillar (masalan seed'dagi `/issues/8043.pdf`)
 * uchun doim `false` — bunday fayl loyihada umuman mavjud emas, ya'ni yuklab olish
 * havolasi 404 beradi. Shu bayroq orqali sayt buzilgan tugmani ko'rsatmaydi, admin
 * panel esa qaysi sonlarga PDF qayta yuklash kerakligini ko'rsatadi.
 */
export function issuePdfExists(pdfUrl: string | null | undefined): boolean {
  const filePath = resolveIssuePdfPath(pdfUrl);
  return filePath !== null && fs.existsSync(filePath);
}

/**
 * PDF faylini diskdan o'chiradi — LEKIN faqat uni boshqa hech qaysi son
 * ishlatmayotgan bo'lsa. Bir xil fayl bir nechta yozuvga biriktirilgan bo'lishi
 * mumkin (masalan admin `pdfUrl`ni qo'lda nusxalagan), shuning uchun oldin sanaymiz.
 *
 * "Fire-and-forget" emas: xato bo'lsa ham chaqiruvchi oqim to'xtamasligi kerak,
 * shuning uchun `unlink` xatosi yutiladi — yozuv allaqachon o'chirilgan/yangilangan.
 */
export async function deleteOrphanIssuePdf(
  pdfUrl: string | null | undefined,
  options: { exceptIssueId?: string } = {}
): Promise<void> {
  const filePath = resolveIssuePdfPath(pdfUrl);
  if (!filePath) return;

  const stillUsed = await prisma.issue.count({
    where: {
      pdfUrl: pdfUrl as string,
      ...(options.exceptIssueId ? { id: { not: options.exceptIssueId } } : {}),
    },
  });
  if (stillUsed > 0) return;

  fs.unlink(filePath, () => {});
}
