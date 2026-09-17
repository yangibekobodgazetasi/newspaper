import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

const visitSchema = z.object({
  path: z.string().min(1).max(500),
  visitorHash: z.string().max(100).optional(),
});

// POST /api/analytics/visit — frontend har bir sahifa ochilganda chaqiradi (auth shart emas)
router.post(
  '/visit',
  asyncHandler(async (req, res) => {
    const data = visitSchema.parse(req.body);
    await prisma.siteVisit.create({ data });
    res.status(201).json({ success: true });
  })
);

export default router;
