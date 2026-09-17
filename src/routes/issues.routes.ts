import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError } from '../middleware/errorHandler';
import { parsePagination, toPaginated } from '../utils/pagination';
import { serializeIssue } from '../utils/serializers';

const router = Router();

// GET /api/issues?page=1&pageSize=20
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        orderBy: { date: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.issue.count(),
    ]);

    res.json(toPaginated(items.map(serializeIssue), total, pagination));
  })
);

// GET /api/issues/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const issue = await prisma.issue.findUnique({ where: { id: req.params.id } });

    if (!issue) {
      throw new NotFoundError('Son topilmadi');
    }

    res.json(serializeIssue(issue));
  })
);

export default router;
