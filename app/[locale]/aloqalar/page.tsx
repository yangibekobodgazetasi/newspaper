import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { MapPin, FileText, Clock3, ShoppingBag } from 'lucide-react';
import LinkTile from '@/components/ui/LinkTile';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface ContactIndexPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: ContactIndexPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/aloqalar', title: t('nav.contact'), description: t('contact.indexLead') });
}

export default function ContactIndexPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className={styles.title}>{t('nav.contact')}</h1>
      <p className={styles.lead}>{t('contact.indexLead')}</p>
      <div className={styles.tiles}>
        <LinkTile href="/aloqalar/manzil" label={t('nav.contactAddress')} description={t('contact.addressDescription')} icon={MapPin} />
        <LinkTile href="/aloqalar/rekvizitlar" label={t('nav.contactRequisites')} description={t('contact.requisitesDescription')} icon={FileText} />
        <LinkTile href="/aloqalar/qabul-jadvali" label={t('nav.contactSchedule')} description={t('contact.scheduleDescription')} icon={Clock3} />
        <LinkTile href="/aloqalar/xaridorlar-uchun" label={t('nav.contactBuyers')} description={t('contact.buyersDescription')} icon={ShoppingBag} />
      </div>
    </div>
  );
}
