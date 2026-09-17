import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { ApiError, NotFoundError } from '../../middleware/errorHandler';
import { validateImage } from '../../utils/validateImage';
import { IMAGE_SPECS, MEDIA_KINDS, isValidMediaKind } from '../../types/imageSpecs';
import { countAssetUsages } from '../../utils/mediaUsage';

const router = Router();

// Rasm YUKLASH va O'CHIRISH huquqlari ataylab ajratilgan: muxbir yangiligiga rasm
// yuklay olishi kerak, lekin boshqalar ishlatayotgan rasmni o'chira olmasligi kerak.
// Shu sababli bu yerda umumiy `router.use(...)` guard'i yo'q — har bir endpoint
// o'ziga kerakli huquqni alohida talab qiladi.
router.use(authGuard);

const UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'uploads');

// GET /api/admin/media/specs — frontendga (admin panelga) har bir tur uchun talab qilinadigan o'lchamlarni beradi
router.get('/specs', requirePermission('media:view'), (req, res) => {
  res.json({ items: MEDIA_KINDS.map((k) => IMAGE_SPECS[k]) });
});

// GET /api/admin/media?kind=NEWS_COVER — shu turdagi barcha yuklangan rasmlar (qayta tanlash uchun)
router.get(
  '/',
  requirePermission('media:view'),
  asyncHandler(async (req, res) => {
    const kind = req.query.kind as string | undefined;
    const where = kind ? { kind } : {};
    const items = await prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ items });
  })
);

// POST /api/admin/media/upload  (multipart/form-data: file, kind)
router.post(
  '/upload',
  requirePermission('media:upload'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { kind } = req.body as { kind?: string };

    if (!req.file) {
      throw new ApiError(400, "Fayl yuborilmadi");
    }
    if (!kind || !isValidMediaKind(kind)) {
      throw new ApiError(400, `Noma'lum rasm turi: ${kind}. Ruxsat etilgan: ${MEDIA_KINDS.join(', ')}`);
    }

    const spec = IMAGE_SPECS[kind];
    if (req.file.size > spec.maxFileSizeMb * 1024 * 1024) {
      throw new ApiError(400, `Fayl hajmi juda katta. Maksimal: ${spec.maxFileSizeMb} MB`);
    }

    const result = await validateImage(req.file.buffer, kind);
    if (!result.valid) {
      throw new ApiError(422, result.message ?? "Rasm spetsifikatsiyaga mos kelmadi");
    }

    fs.mkdirSync(path.join(UPLOAD_DIR, kind.toLowerCase()), { recursive: true });

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const relativePath = `${kind.toLowerCase()}/${filename}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, relativePath), req.file.buffer);

    const asset = await prisma.mediaAsset.create({
      data: {
        kind,
        url: `/uploads/${relativePath}`,
        width: result.width,
        height: result.height,
        scale: result.scale ?? '1x',
        fileSizeKb: Math.round(req.file.size / 1024),
        originalName: req.file.originalname,
        uploadedBy: req.user?.username,
      },
    });

    res.status(201).json(asset);
  })
);

// GET /api/admin/media/:id/usage — rasm o'chirilishidan oldin qayerda ishlatilganini ko'rsatish uchun
router.get(
  '/:id/usage',
  requirePermission('media:view'),
  asyncHandler(async (req, res) => {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
    if (!asset) throw new NotFoundError('Rasm topilmadi');

    const usage = await countAssetUsages(asset.url);
    res.json({
      total: usage.total,
      news: usage.news,
      issues: usage.issues,
      team: usage.team,
      gallery: usage.gallery,
      staticContent: usage.staticContent,
    });
  })
);

// DELETE /api/admin/media/:id
router.delete(
  '/:id',
  requirePermission('media:delete'),
  asyncHandler(async (req, res) => {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
    if (!asset) throw new NotFoundError('Rasm topilmadi');

    // Ishlatilayotgan rasmni o'chirishga YO'L QO'YILMAYDI — aks holda bog'langan
    // yozuvlarda buzilgan rasm qoladi. Admin avval o'sha yozuvlardan rasmni olib
    // tashlashi kerak (har bir formadagi "Rasmni olib tashlash" tugmasi orqali).
    const usage = await countAssetUsages(asset.url);
    if (usage.total > 0) {
      throw new ApiError(
        409,
        `Bu rasm hozir ishlatilmoqda (${usage.labels.join(', ')}). ` +
          "O'chirishdan oldin uni o'sha yozuvlardan olib tashlang."
      );
    }

    // Avval baza yozuvi, keyin fayl: agar `delete` xato bersa, fayl joyida qoladi va
    // rasm ishlashda davom etadi. Teskari tartibda fayl yo'qolib, yozuv qolib ketardi.
    await prisma.mediaAsset.delete({ where: { id: req.params.id } });

    const filePath = path.join(UPLOAD_DIR, asset.url.replace('/uploads/', ''));
    fs.unlink(filePath, () => {}); // fayl topilmasa ham indamay o'tamiz

    res.json({ success: true });
  })
);

export default router;
