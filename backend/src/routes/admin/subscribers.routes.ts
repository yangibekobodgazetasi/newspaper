import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { parsePagination, toPaginated } from '../../utils/pagination';

const router = Router();
router.use(authGuard, requirePermission({ read: 'subscribers:view', write: 'subscribers:manage' }));

// GET /api/admin/subscribers
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);
    const [items, total] = await Promise.all([
      prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      prisma.subscriber.count(),
    ]);
    res.json(toPaginated(items, total, pagination));
  })
);

// DELETE /api/admin/subscribers/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.subscriber.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Obunachi topilmadi');

    await prisma.subscriber.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
