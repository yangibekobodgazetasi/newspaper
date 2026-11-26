import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { parsePagination, toPaginated } from '../../utils/pagination';

const router = Router();
router.use(authGuard, requirePermission('questions:moderate'));

// GET /api/admin/questions?status=pending
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);
    const status = req.query.status as string | undefined;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.questionAnswer.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      prisma.questionAnswer.count({ where }),
    ]);
    res.json(toPaginated(items, total, pagination));
  })
);

const answerSchema = z.object({ answer: z.string().min(2) });

// PUT /api/admin/questions/:id/answer
router.put(
  '/:id/answer',
  asyncHandler(async (req, res) => {
    const { answer } = answerSchema.parse(req.body);
    const existing = await prisma.questionAnswer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Savol topilmadi');

    const item = await prisma.questionAnswer.update({
      where: { id: req.params.id },
      data: { answer, status: 'answered' },
    });
    res.json(item);
  })
);

// DELETE /api/admin/questions/:id — nomaqbul yoki spam savolni o'chirish
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.questionAnswer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Savol topilmadi');

    await prisma.questionAnswer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
