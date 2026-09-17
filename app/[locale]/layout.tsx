import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_NAME, getSiteUrl } from '@/lib/seo';
import { getSortedIssues } from '@/lib/issues';
import { formatLocalizedDate } from '@/lib/date';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VisitTracker from '@/components/analytics/VisitTracker';
import '@/styles/global.scss';

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// Barcha sahifalar uchun umumiy metadata poydevori: `metadataBase` bolalar
// generateMetadata'laridagi nisbiy yo'llarni (canonical, OG rasm va h.k.) to'g'ri
// to'liq URL'ga aylantiradi; `title.template` esa har bir sahifada
// "— Yangi Bekobod" qo'shimchasini qayta yozishning oldini oladi (DRY).
export async function generateMetadata(props: RootLayoutProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      template: `%s — ${SITE_NAME}`,
      default: `${SITE_NAME} — ${t('masthead.tagline')}`,
    },
    description: t('seo.home.description'),
    // Favicon to'plami `public/` da (design/favicon dan ko'chirilgan, o'zgartirilmagan).
    // `.ico` — eski brauzerlar, `.svg` — zamonaviy/theme-aware, 96px PNG — fallback,
    // apple-touch-icon — iOS "home screen" uchun.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.webmanifest',
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: RootLayoutProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Statik generatsiya vaqtida `next-intl/server` funksiyalari (masalan getMessages)
  // qaysi locale ekanini bilishi uchun — next-intl'ning tavsiya etilgan patterni.
  setRequestLocale(locale);

  const messages = await getMessages();

  // Header'dagi son ma'lumoti avval kodga yozib qo'yilgan edi ("№25 (8043) · 2026-yil
  // 30-iyun") — ya'ni yangi son qo'shilsa ham o'zgarmasdi va /ru, /en sahifalarida
  // o'zbekcha sana chiqardi. Endi bazadagi eng oxirgi sondan olinadi va til bo'yicha
  // formatlanadi. Ro'yxat bo'sh bo'lsa qator umuman chiqmaydi.
  const [latestIssue] = await getSortedIssues(1);
  const issueLine = latestIssue
    ? `№${latestIssue.number} (${latestIssue.id}) · ${formatLocalizedDate(latestIssue.date, locale)}`
    : undefined;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <VisitTracker />
          <Header issueLine={issueLine} />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
