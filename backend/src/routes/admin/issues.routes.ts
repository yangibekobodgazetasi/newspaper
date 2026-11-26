import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { ApiError, NotFoundError } from '../../middleware/errorHandler';
import { uploadPdf } from '../../middleware/upload';
import { parsePagination, toPaginated } from '../../utils/pagination';
import { serializeIssue } from '../../utils/serializers';
import { ISSUE_PDF_SPEC, PDF_MAGIC_BYTES, formatFileSize } from '../../types/fileSpecs';
import { UPLOAD_DIR, PDF_SUBDIR, deleteOrphanIssuePdf } from '../../utils/issueFiles';

const router = Router();
router.use(authGuard, requirePermission({ read: 'issues:view', write: 'issues:manage' }));

const issueSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  date: z.string(),
  pages: z.number().int().positive(),
  fileSize: z.string(),
  pdfUrl: z.string().url().or(z.string().startsWith('/')),
  // `.nullable()` MUHIM: muqovani olib tashlash uchun `null` yuborish kerak.
  // Faqat `.optional()` bo'lsa Prisma'ga `undefined` tushib, "o'zgartirmaslik"
  // degani bo'lardi va rasm hech qachon o'chmasdi.
  coverImage: z.string().nullable().optional(),
});

// GET /api/admin/issues/pdf-spec — admin panel frontend validatsiyasi uchun chegaralar.
// Bitta manba (types/fileSpecs.ts) — frontend va backend hech qachon ajralib qolmaydi.
router.get('/pdf-spec', (req, res) => {
  res.json(ISSUE_PDF_SPEC);
});

/**
 * POST /api/admin/issues/upload-pdf  (multipart/form-data: file)
 *
 * Uch bosqichli tekshiruv:
 *  1) `uploadPdf` multer chegarasi — 20MB dan katta fayl umuman qabul qilinmaydi;
 *  2) `fileFilter` — kengaytma va MIME turi (mijoz yuboradigan, ishonchsiz ma'lumot);
 *  3) imzo baytlari (`%PDF-`) — nomi almashtirilgan soxta faylni shu bosqich ushlaydi.
 *
 * Fayl nomi serverda qaytadan generatsiya qilinadi (vaqt + tasodifiy son): asl nom
 * yo'lga tushmaydi, ya'ni path traversal va nom to'qnashuvi bo'lishi mumkin emas.
 */
router.post(
  '/upload-pdf',
  uploadPdf.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Fayl yuborilmadi');

    const header = req.file.buffer.subarray(0, PDF_MAGIC_BYTES.length).toString('latin1');
    if (header !== PDF_MAGIC_BYTES) {
      throw new ApiError(422, "Fayl haqiqiy PDF emas (ichki tuzilishi mos kelmadi)");
    }

    fs.mkdirSync(path.join(UPLOAD_DIR, PDF_SUBDIR), { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.pdf`;
    const relativePath = `${PDF_SUBDIR}/${filename}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, relativePath), req.file.buffer);

    res.status(201).json({
      url: `/uploads/${relativePath}`,
      originalName: req.file.originalname,
      fileSize: formatFileSize(req.file.size), // Issue.fileSize maydoni shu ko'rinishda saqlanadi
      fileSizeKb: Math.round(req.file.size / 1024),
    });
  })
);

// GET /api/admin/issues
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.issue.findMany({ orderBy: { date: 'desc' }, skip: pagination.skip, take: pagination.take }),
      prisma.issue.count(),
    ]);
    res.json(toPaginated(items.map(serializeIssue), total, pagination));
  })
);

// GET /api/admin/issues/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const issue = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!issue) throw new NotFoundError('Son topilmadi');
    res.json(serializeIssue(issue));
  })
);

// POST /api/admin/issues  (dizayner PDF va muqovani yuklab, sonni e'lon qiladi)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = issueSchema.parse(req.body);
    const issue = await prisma.issue.create({ data: { ...data, date: new Date(data.date) } });
    res.status(201).json(serializeIssue(issue));
  })
);

// PUT /api/admin/issues/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    // `id` — birlamchi kalit, o'zgartirilmaydi. Mijoz uni yuborsa ham e'tiborsiz
    // qoldiriladi (aks holda tasodifiy/noto'g'ri qiymat yozuvning kalitini almashtirib,
    // unga bog'liq havolalarni buzib qo'yishi mumkin edi).
    const { id: _ignoredId, ...data } = issueSchema.partial().parse(req.body);

    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Son topilmadi');

    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    });

    // PDF almashtirilgan bo'lsa eskisi diskda yetim qolib ketmasin.
    // Yozuv YANGILANGANDAN KEYIN o'chiramiz: `update` xato bersa eski fayl joyida
    // qoladi va son ishlashda davom etadi.
    if (data.pdfUrl && data.pdfUrl !== existing.pdfUrl) {
      await deleteOrphanIssuePdf(existing.pdfUrl, { exceptIssueId: req.params.id });
    }
    res.json(serializeIssue(issue));
  })
);

// DELETE /api/admin/issues/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Son topilmadi');

    // Avval baza yozuvi, keyin fayl (rasmlardagi bilan bir xil tartib): `delete`
    // xato bersa fayl joyida qoladi va son ishlashda davom etadi.
    await prisma.issue.delete({ where: { id: req.params.id } });
    await deleteOrphanIssuePdf(existing.pdfUrl);

    res.json({ success: true });
  })
);

export default router;
