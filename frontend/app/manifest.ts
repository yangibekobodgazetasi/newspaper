import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/seo';

// `app/robots.ts` va `app/sitemap.ts` bilan bir xil uslub — Next.js file-convention.
// Ikonkalar `public/` dagi design/favicon to'plamidan olinadi (qayta generatsiya qilinmagan).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: '#0B2A4A', // $river-deep — masthead/footer foni bilan bir xil
    background_color: '#ffffff',
    display: 'standalone',
  };
}
