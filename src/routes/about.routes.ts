import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';
import { isAboutSlug } from '../types/constants';
import { resolveLocale, getRequestedLocale } from '../utils/translation';
import { getStaticContentData } from '../utils/staticContent';

const router = Router();

// GET /api/about?lang=ru  ->  "umumiy" sahifasi
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    res.json(await getStaticContentData('about:umumiy', locale, defaultLocale));
  })
);

// GET /api/about/:slug?lang=ru  ->  maqsad-va-vazifalar | hamkorlik | korrupsiyaga-qarshi-kurashish
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { slug } = req.params;

    if (!isAboutSlug(slug) || slug === 'umumiy') {
      throw new ApiError(400, `Noma'lum sahifa: ${slug}`);
    }

    const { locale, defaultLocale } = await resolveLocale(getRequestedLocale(req.query));
    res.json(await getStaticContentData(`about:${slug}`, locale, defaultLocale));
  })
);

export default router;
