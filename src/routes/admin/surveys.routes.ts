import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';

const router = Router();
router.use(authGuard, requirePermission({ read: 'surveys:view', write: 'surveys:manage' }));

// GET /api/admin/surveys
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      include: { options: true },
    });
    res.json({ items: surveys });
  })
);

const createSchema = z.object({
  question: z.string().min(3),
  options: z.array(z.string().min(1)).min(2, "Kamida 2 ta variant kerak"),
});

// POST /api/admin/surveys  — yangisini yaratganda avvalgi faol so'rov avtomatik yopiladi
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    await prisma.survey.updateMany({ where: { isActive: true }, data: { isActive: false } });

    const survey = await prisma.survey.create({
      data: {
        question: data.question,
        isActive: true,
        options: { create: data.options.map((label) => ({ label, votes: 0 })) },
      },
      include: { options: true },
    });

    res.status(201).json(survey);
  })
);

// PATCH /api/admin/surveys/:id/close
router.patch(
  '/:id/close',
  asyncHandler(async (req, res) => {
    const existing = await prisma.survey.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError("So'rov topilmadi");

    const survey = await prisma.survey.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json(survey);
  })
);

export default router;
