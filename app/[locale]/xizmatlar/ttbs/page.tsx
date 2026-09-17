import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FaqAccordion from '@/components/services/FaqAccordion';
import { getFaq } from '@/lib/services';
import { buildMetadata } from '@/lib/seo';
import styles from '../../aloqalar/page.module.scss';

interface FaqPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: FaqPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'services' });
  return buildMetadata({ locale, path: '/xizmatlar/ttbs', title: t('faqTitle'), description: t('faqLead') });
}

export default async function FaqPage({ params: { locale } }: FaqPageProps) {
  const t = await getTranslations('services');
  const faq = await getFaq(locale);
  return (
    <div>
      <h1 className={styles.title}>{t('faqTitle')}</h1>
      <p className={styles.lead}>{t('faqLead')}</p>
      <FaqAccordion items={faq} />
    </div>
  );
}
