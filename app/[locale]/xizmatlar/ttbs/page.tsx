import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FaqAccordion from '@/components/services/FaqAccordion';
import { getFaq } from '@/lib/services';
import { buildMetadata } from '@/lib/seo';
import styles from '../../aloqalar/page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: FaqPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: 'services' });
  return buildMetadata({ locale, path: '/xizmatlar/ttbs', title: t('faqTitle'), description: t('faqLead') });
}

export default async function FaqPage(props: FaqPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

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
