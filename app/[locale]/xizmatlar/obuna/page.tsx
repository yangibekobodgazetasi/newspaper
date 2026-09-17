import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import SubscribeForm from '@/components/services/SubscribeForm';
import { buildMetadata } from '@/lib/seo';
import styles from '../../aloqalar/page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface SubscribePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: SubscribePageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: 'services' });
  return buildMetadata({ locale, path: '/xizmatlar/obuna', title: t('subscribeTitle'), description: t('subscribeLead') });
}

export default function SubscribePage() {
  const t = useTranslations('services');

  return (
    <div>
      <h1 className={styles.title}>{t('subscribeTitle')}</h1>
      <p className={styles.lead}>{t('subscribeLead')}</p>
      <SubscribeForm />
    </div>
  );
}
