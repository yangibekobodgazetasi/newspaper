import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import MurojaatForm from '@/components/services/MurojaatForm';
import { buildMetadata } from '@/lib/seo';
import styles from '../page.module.scss';

interface MurojaatPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: MurojaatPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'contact' });
  return buildMetadata({ locale, path: '/aloqalar/murojaat', title: t('murojaatTitle'), description: t('murojaatLead') });
}

export default function MurojaatPage() {
  const t = useTranslations('contact');

  return (
    <div>
      <h1 className={styles.title}>{t('murojaatTitle')}</h1>
      <p className={styles.lead}>{t('murojaatLead')}</p>
      <MurojaatForm />
    </div>
  );
}
