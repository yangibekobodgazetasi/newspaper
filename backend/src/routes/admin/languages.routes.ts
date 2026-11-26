import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { ApiError, NotFoundError } from '../../middleware/errorHandler';

const router = Router();
// Til boshqaruvi butun saytning tuzilishiga ta'sir qiladi — faqat SUPER_ADMIN.
router.use(authGuard, requirePermission({ read: 'languages:view', write: 'languages:manage' }));

// GET /api/admin/languages — barcha tillar (nofaollari ham) boshqaruv jadvali uchun
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.language.findMany({ orderBy: { order: 'asc' } });
    res.json({ items });
  })
);

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  isRTL: z.boolean().optional(),
  order: z.number().int().optional(),
});

// PUT /api/admin/languages/:code — nom, RTL belgisi, tartib. isActive/isDefault
// alohida (quyidagi) endpointlar orqali boshqariladi — ularda qo'shimcha biznes qoidalari bor.
router.put(
  '/:code',
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.language.findUnique({ where: { code: req.params.code } });
    if (!existing) throw new NotFoundError('Til topilmadi');

    const language = await prisma.language.update({ where: { code: req.params.code }, data });
    res.json(language);
  })
);

// PATCH /api/admin/languages/:code/activate
router.patch(
  '/:code/activate',
  asyncHandler(async (req, res) => {
    const existing = await prisma.language.findUnique({ where: { code: req.params.code } });
    if (!existing) throw new NotFoundError('Til topilmadi');

    const language = await prisma.language.update({ where: { code: req.params.code }, data: { isActive: true } });
    res.json(language);
  })
);

// PATCH /api/admin/languages/:code/deactivate
// Standart tilni o'chirib bo'lmaydi — avval boshqa tilni standart qilib belgilash kerak.
// Til yozuvi FIZIK O'CHIRILMAYDI, faqat isActive=false bo'ladi (mavjud tarjimalar saqlanib qoladi).
router.patch(
  '/:code/deactivate',
  asyncHandler(async (req, res) => {
    const existing = await prisma.language.findUnique({ where: { code: req.params.code } });
    if (!existing) throw new NotFoundError('Til topilmadi');

    if (existing.isDefault) {
      throw new ApiError(400, "Standart tilni o'chirib bo'lmaydi — avval boshqa tilni standart qilib belgilang");
    }

    const language = await prisma.language.update({ where: { code: req.params.code }, data: { isActive: false } });
    res.json(language);
  })
);

// PATCH /api/admin/languages/:code/set-default — standart tilni almashtiradi.
// Tranzaksiya: eski standart tildan isDefault=false, yangisiga isDefault=true —
// bir vaqtning o'zida ikkita standart til bo'lib qolmasligi kafolatlanadi.
router.patch(
  '/:code/set-default',
  asyncHandler(async (req, res) => {
    const target = await prisma.language.findUnique({ where: { code: req.params.code } });
    if (!target) throw new NotFoundError('Til topilmadi');

    if (!target.isActive) {
      throw new ApiError(400, "Nofaol tilni standart qilib belgilab bo'lmaydi — avval faollashtiring");
    }

    if (target.isDefault) {
      return res.json(target);
    }

    const [, newDefault] = await prisma.$transaction([
      prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } }),
      prisma.language.update({ where: { code: req.params.code }, data: { isDefault: true } }),
    ]);

    res.json(newDefault);
  })
);

export default router;
