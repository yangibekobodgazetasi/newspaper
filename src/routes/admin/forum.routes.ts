import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { parsePagination, toPaginated } from '../../utils/pagination';

const router = Router();
router.use(authGuard, requirePermission('forum:moderate'));

// GET /api/admin/forum
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.forumTopic.findMany({ orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      prisma.forumTopic.count(),
    ]);
    res.json(toPaginated(items, total, pagination));
  })
);

// DELETE /api/admin/forum/:id  — nomaqbul mavzuni o'chirish
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.forumTopic.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Mavzu topilmadi');

    await prisma.forumTopic.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
