import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { getLanguageContext } from '../../utils/translation';

const router = Router();
router.use(authGuard, requirePermission('dashboard:view'));

// GET /api/admin/dashboard
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { defaultLocale } = await getLanguageContext();

    const [newsCount, issuesCount, subscribersCount, pendingQuestions, forumTopicsCount, activeSurvey, visitsLast24h] =
      await Promise.all([
        prisma.news.count(),
        prisma.issue.count(),
        prisma.subscriber.count(),
        prisma.questionAnswer.count({ where: { status: 'pending' } }),
        prisma.forumTopic.count(),
        prisma.survey.findFirst({ where: { isActive: true }, include: { options: true } }),
        prisma.siteVisit.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      ]);

    // News endi o'zida sarlavha saqlamaydi (NewsTranslation'ga ko'chgan) — standart til
    // tarjimasidan olamiz, u ham topilmasa (juda kam holat) sarlavha bo'sh qoladi.
    interface RecentNewsRow {
      id: string;
      publishedAt: Date;
      translations: { title: string }[];
    }
    const recentNewsRows: RecentNewsRow[] = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { translations: { where: { locale: defaultLocale }, select: { title: true } } },
    });
    const recentNews = recentNewsRows.map((n: RecentNewsRow) => ({
      id: n.id,
      title: n.translations[0]?.title ?? '(tarjima yo\'q)',
      publishedAt: n.publishedAt.toISOString().slice(0, 10),
    }));

    // "Batafsil" ko'rinishi uchun kerakli maydonlar aniq ro'yxatlanadi (select) — kelajakda
    // ContactMessage sxemasiga qo'shiladigan har qanday yangi maydon shu ro'yxatga qo'shilmaguncha
    // bu yerdan avtomatik chiqmaydi.
    const recentMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        ticketId: true,
        fullName: true,
        phone: true,
        email: true,
        subject: true,
        message: true,
        createdAt: true,
      },
    });

    res.json({
      counts: {
        news: newsCount,
        issues: issuesCount,
        subscribers: subscribersCount,
        pendingQuestions,
        forumTopics: forumTopicsCount,
        visitsLast24h,
      },
      activeSurvey,
      recentNews,
      recentMessages,
    });
  })
);

export default router;
