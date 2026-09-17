import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Bu frontend ilovasida `/admin` route'i mavjud emas (admin panel alohida ilova),
      // lekin production'da reverse-proxy orqali bir domenga chiqarilishi mumkinligi uchun
      // ehtiyot chorasi sifatida bloklanadi.
      disallow: ['/admin'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
