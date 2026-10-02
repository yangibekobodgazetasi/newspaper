import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Phone, ShieldAlert } from 'lucide-react';
import AboutArticle from '@/components/about/AboutArticle';
import { getAboutContent } from '@/lib/about';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface AntiCorruptionPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: AntiCorruptionPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const content = await getAboutContent('korrupsiyaga-qarshi-kurashish', locale);
  return buildMetadata({ locale, path: '/gazeta-haqida/korrupsiyaga-qarshi-kurashish', title: content.title, description: content.intro });
}

export default async function AntiCorruptionPage(props: AntiCorruptionPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations('about');
  const content = await getAboutContent('korrupsiyaga-qarshi-kurashish', locale);
  return (
    <AboutArticle {...content}>
      <div className={styles.hotlineBox}>
        <ShieldAlert size={22} className={styles.icon} />
        <div>
          <h2>{t('hotline')}</h2>
          <a href={`tel:${content.hotline}`} className={styles.phone}>
            <Phone size={14} /> {content.hotline}
          </a>
          {content.trustLineUrl && (
            <a href={content.trustLineUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {content.trustLineUrl}
            </a>
          )}
        </div>
      </div>
    </AboutArticle>
  );
}
