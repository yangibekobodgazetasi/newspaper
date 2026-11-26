import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import newsRoutes from './news.routes';
import issuesRoutes from './issues.routes';
import teamRoutes from './team.routes';
import staticContentRoutes from './staticContent.routes';
import usersRoutes from './users.routes';
import forumRoutes from './forum.routes';
import questionsRoutes from './questions.routes';
import subscribersRoutes from './subscribers.routes';
import surveysRoutes from './surveys.routes';
import mediaRoutes from './media.routes';
import analyticsRoutes from './analytics.routes';
import categoriesRoutes from './categories.routes';
import galleryRoutes from './gallery.routes';
import faqRoutes from './faq.routes';
import languagesRoutes from './languages.routes';
import { revalidateOnMutation } from '../../utils/revalidate';

const router = Router();

// Har qanday muvaffaqiyatli admin mutatsiyasidan keyin frontend keshini bekor qiladi.
// Barcha sub-router'lardan OLDIN turadi — yangi admin endpoint qo'shilganda ham
// avtomatik ishlaydi (bkl. utils/revalidate.ts izohi).
router.use(revalidateOnMutation);

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/news', newsRoutes);
router.use('/issues', issuesRoutes);
router.use('/team', teamRoutes);
router.use('/static-content', staticContentRoutes);
router.use('/users', usersRoutes);
router.use('/forum', forumRoutes);
router.use('/questions', questionsRoutes);
router.use('/subscribers', subscribersRoutes);
router.use('/surveys', surveysRoutes);
router.use('/media', mediaRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/gallery', galleryRoutes);
router.use('/faq', faqRoutes);
router.use('/languages', languagesRoutes);

export default router;
