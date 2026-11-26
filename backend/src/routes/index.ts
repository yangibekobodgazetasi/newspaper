import { Router } from 'express';
import aboutRoutes from './about.routes';
import issuesRoutes from './issues.routes';
import newsRoutes from './news.routes';
import servicesRoutes from './services.routes';
import teamRoutes from './team.routes';
import contactRoutes from './contact.routes';
import homeRoutes from './home.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin';

const router = Router();

router.use('/about', aboutRoutes);
router.use('/issues', issuesRoutes);
router.use('/news', newsRoutes);
router.use('/services', servicesRoutes);
router.use('/team', teamRoutes);
router.use('/contact', contactRoutes);
router.use('/home', homeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

export default router;
