import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { parsePagination, toPaginated } from '../../utils/pagination';
import { serializeMediaItem } from '../../utils/serializers';

const router = Router();
router.use(authGuard, requirePermission({ read: 'gallery:view', write: 'gallery:manage' }));

const gallerySchema = z.object({
  caption: z.string().min(2),
  publishedAt: z.string(), // "YYYY-MM-DD"
  cover: z.enum(['gradient-1', 'gradient-2', 'gradient-3', 'gradient-4']).optional(),
  // `.nullable()` — rasmni olib tashlash uchun (bkl. news/team routes'dagi izoh).
  imageUrl: z.string().nullable().optional(),
});

// GET /api/admin/gallery
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({ orderBy: { publishedAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      prisma.mediaItem.count(),
    ]);
    res.json(toPaginated(items.map(serializeMediaItem), total, pagination));
  })
);

// POST /api/admin/gallery
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = gallerySchema.parse(req.body);
    const item = await prisma.mediaItem.create({
      data: { ...data, cover: data.cover ?? 'gradient-1', publishedAt: new Date(data.publishedAt) },
    });
    res.status(201).json(serializeMediaItem(item));
  })
);

// PUT /api/admin/gallery/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = gallerySchema.partial().parse(req.body);
    const existing = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Galereya elementi topilmadi');

    const item = await prisma.mediaItem.update({
      where: { id: req.params.id },
      data: { ...data, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined },
    });
    res.json(serializeMediaItem(item));
  })
);

// DELETE /api/admin/gallery/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.mediaItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Galereya elementi topilmadi');

    await prisma.mediaItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
