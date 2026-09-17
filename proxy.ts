import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Faqat sahifa route'larida ishlaydi — /api, Next.js ichki fayllari (_next)
  // va nuqta bilan tugaydigan statik fayllar (favicon.ico va h.k.) chetlab o'tiladi.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
