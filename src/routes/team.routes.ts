import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { serializeTeamMember } from '../utils/serializers';
import { resolveLocale, pickTranslation, getRequestedLocale } from '../utils/translation';

// Prisma Client hali generatsiya qilinmagan muhitda ham implicit-any xatolarisiz
// kompilyatsiya bo'lishi uchun minimal mahalliy tiplar.
interface TeamTranslationRow {
  locale: string;
  role: string;
  description: string | null;
}
interface TeamMemberRow {
  id: string;
  name: string;
  photo: string | null;
  translations: TeamTranslationRow[];
}

const router = Router();

// GET /api/team?lang=ru
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));

    const members: TeamMemberRow[] = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true }, // kichik jadval — barcha tarjimalarni olish arzon
    });

    const items = members
      .map((member: TeamMemberRow) => {
        const translation = pickTranslation<TeamTranslationRow>(member.translations, locale, defaultLocale);
        return translation ? serializeTeamMember(member, translation) : null;
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    res.json({ items });
  })
);

export default router;
