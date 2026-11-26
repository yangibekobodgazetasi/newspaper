import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { NotFoundError, ApiError } from '../middleware/errorHandler';
import { parsePagination, toPaginated } from '../utils/pagination';
import { LOCALES } from '../types/constants';
import { buildThrottleCreate, throwIfThrottleViolation } from '../utils/submissionThrottle';
import { resolveLocale, pickTranslation, getRequestedLocale } from '../utils/translation';

// Prisma Client hali generatsiya qilinmagan muhitda ham implicit-any xatolarisiz
// kompilyatsiya bo'lishi uchun minimal mahalliy tiplar (loyihadagi mavjud naqsh).
interface FaqTranslationRow {
  locale: string;
  question: string;
  answer: string;
}
interface FaqItemRow {
  id: string;
  translations: FaqTranslationRow[];
}

const router = Router();

// ---- So'rov ----

// GET /api/services/sorov  -> faol so'rovnoma
router.get(
  '/sorov',
  asyncHandler(async (req, res) => {
    const survey = await prisma.survey.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { options: true },
    });

    if (!survey) {
      throw new NotFoundError("Faol so'rovnoma topilmadi");
    }

    res.json({
      id: survey.id,
      question: survey.question,
      isActive: survey.isActive,
      options: survey.options.map((o: { id: string; label: string; votes: number }) => ({
        id: o.id,
        label: o.label,
        votes: o.votes,
      })),
    });
  })
);

// POST /api/services/sorov/:id/vote
router.post(
  '/sorov/:id/vote',
  asyncHandler(async (req, res) => {
    const { optionId } = z.object({ optionId: z.string() }).parse(req.body);

    const option = await prisma.surveyOption.findFirst({
      where: { id: optionId, surveyId: req.params.id },
    });

    if (!option) {
      throw new ApiError(400, "Noto'g'ri variant tanlandi");
    }

    await prisma.surveyOption.update({ where: { id: optionId }, data: { votes: { increment: 1 } } });

    res.json({ success: true });
  })
);

// ---- Forum ----

// GET /api/services/forum?page=1&pageSize=20
router.get(
  '/forum',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.forumTopic.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.forumTopic.count(),
    ]);

    res.json(
      toPaginated(
        items.map((t: { id: string; title: string; authorName: string; createdAt: Date; replyCount: number }) => ({
          id: t.id,
          title: t.title,
          authorName: t.authorName,
          createdAt: t.createdAt.toISOString(),
          replyCount: t.replyCount,
        })),
        total,
        pagination
      )
    );
  })
);

const forumTopicSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(3),
  authorName: z.string().min(2),
  authorEmail: z.string().email().optional(),
});

// POST /api/services/forum
router.post(
  '/forum',
  asyncHandler(async (req, res) => {
    const data = forumTopicSchema.parse(req.body);
    const topic = await prisma.forumTopic.create({ data });
    res.status(201).json({ id: topic.id, success: true });
  })
);

// ---- Savol-javob ----

// GET /api/services/savol-javob?page=1&pageSize=20
router.get(
  '/savol-javob',
  asyncHandler(async (req, res) => {
    const pagination = parsePagination(req);

    const [items, total] = await Promise.all([
      prisma.questionAnswer.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.questionAnswer.count(),
    ]);

    res.json(
      toPaginated(
        items.map((q: { id: string; question: string; answer: string | null; askedBy: string; status: string; createdAt: Date }) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          askedBy: q.askedBy,
          status: q.status,
          createdAt: q.createdAt.toISOString().slice(0, 10),
        })),
        total,
        pagination
      )
    );
  })
);

const questionSchema = z.object({
  question: z.string().min(5),
  askedBy: z.string().min(2),
  email: z.string().email().optional(),
  visitorHash: z.string().max(100).optional(),
});

// POST /api/services/savol-javob
router.post(
  '/savol-javob',
  asyncHandler(async (req, res) => {
    const { visitorHash, ...data } = questionSchema.parse(req.body);

    const [, item] = await prisma
      .$transaction([buildThrottleCreate('SAVOL', req, visitorHash), prisma.questionAnswer.create({ data })])
      .catch((err) => throwIfThrottleViolation('SAVOL', err));

    res.status(201).json({ id: item.id, status: item.status, success: true });
  })
);

// ---- TTBS (FAQ) ----

// GET /api/services/ttbs?lang=ru
// Savol/javob matni FaqItemTranslation'da — News/Team bilan bir xil naqsh.
router.get(
  '/ttbs',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));

    const items: FaqItemRow[] = await prisma.faqItem.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true }, // kichik jadval — barcha tarjimalarni olish arzon
    });

    res.json({
      items: items
        .map((f: FaqItemRow) => {
          const translation = pickTranslation<FaqTranslationRow>(f.translations, locale, defaultLocale);
          return translation ? { id: f.id, question: translation.question, answer: translation.answer } : null;
        })
        .filter((f): f is NonNullable<typeof f> => f !== null),
    });
  })
);

// ---- Obuna ----

const subscribeSchema = z.object({
  fullName: z.string().min(2),
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Telefon raqami noto'g'ri formatda (masalan: +998901234567)"),
  email: z.string().email().optional(),
  locale: z.enum(LOCALES).default('uz-latin'),
});

const ALREADY_SUBSCRIBED_MESSAGE = "Siz allaqachon obuna bo'lgansiz";

// POST /api/services/obuna
router.post(
  '/obuna',
  asyncHandler(async (req, res) => {
    const data = subscribeSchema.parse(req.body);

    // Tezkor, foydalanuvchiga qulay yo'l — aksariyat holatda shu yerda to'xtaydi.
    const existing = await prisma.subscriber.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw new ApiError(409, ALREADY_SUBSCRIBED_MESSAGE);
    }

    // `phone` ustunidagi DB darajasidagi @unique constraint — bir vaqtning o'zida kelgan
    // duplicate so'rovlar orasidagi race condition'dan himoyalaydi (yuqoridagi tekshiruv
    // ikkalasi ham "yo'q" deb ko'rishi mumkin, lekin faqat bitta `create()` muvaffaqiyatli bo'ladi).
    try {
      await prisma.subscriber.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ApiError(409, ALREADY_SUBSCRIBED_MESSAGE);
      }
      throw err;
    }

    res.status(201).json({ success: true, message: 'Obuna muvaffaqiyatli amalga oshirildi' });
  })
);

export default router;
