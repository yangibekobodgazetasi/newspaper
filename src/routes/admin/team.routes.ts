import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { NotFoundError } from '../../middleware/errorHandler';
import { serializeTeamMemberAdmin } from '../../utils/serializers';
import { validateTranslationsInput } from '../../utils/translation';

const router = Router();
router.use(authGuard, requirePermission({ read: 'team:view', write: 'team:manage' }));

const teamTranslationSchema = z.object({
  locale: z.string().min(2),
  role: z.string().min(2),
  description: z.string().optional(),
});

const teamSchema = z.object({
  name: z.string().min(2), // tarjima qilinmaydi
  photo: z.string().nullable().optional(),
  order: z.number().int().optional(),
  translations: z.array(teamTranslationSchema),
});

const teamWithTranslations = { include: { translations: true } } as const;

// GET /api/admin/team
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const members = await prisma.teamMember.findMany({ orderBy: { order: 'asc' }, ...teamWithTranslations });
    res.json({ items: members.map(serializeTeamMemberAdmin) });
  })
);

// GET /api/admin/team/:id — barcha tillardagi tarjimalar bilan (tahrirlash formasi uchun)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const member = await prisma.teamMember.findUnique({ where: { id: req.params.id }, ...teamWithTranslations });
    if (!member) throw new NotFoundError("Jamoa a'zosi topilmadi");
    res.json(serializeTeamMemberAdmin(member));
  })
);

// POST /api/admin/team
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = teamSchema.parse(req.body);
    await validateTranslationsInput(data.translations);

    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        photo: data.photo,
        order: data.order,
        translations: { create: data.translations },
      },
      ...teamWithTranslations,
    });

    res.status(201).json(serializeTeamMemberAdmin(member));
  })
);

const teamUpdateSchema = teamSchema.partial().extend({
  translations: z.array(teamTranslationSchema).optional(),
});

// PUT /api/admin/team/:id — translations[] ixtiyoriy: yuborilgan tillar upsert qilinadi
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = teamUpdateSchema.parse(req.body);
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError("Jamoa a'zosi topilmadi");

    if (data.translations) {
      await validateTranslationsInput(data.translations);

      for (const t of data.translations) {
        await prisma.teamMemberTranslation.upsert({
          where: { memberId_locale: { memberId: req.params.id, locale: t.locale } },
          create: { memberId: req.params.id, locale: t.locale, role: t.role, description: t.description },
          update: { role: t.role, description: t.description },
        });
      }
    }

    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: { name: data.name, photo: data.photo, order: data.order },
      ...teamWithTranslations,
    });

    res.json(serializeTeamMemberAdmin(member));
  })
);

// DELETE /api/admin/team/:id — TeamMemberTranslation'lar `onDelete: Cascade` orqali avtomatik o'chadi
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError("Jamoa a'zosi topilmadi");

    await prisma.teamMember.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
