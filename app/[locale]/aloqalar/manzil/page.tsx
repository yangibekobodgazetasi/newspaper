import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getManzil } from '@/lib/contact';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface AddressPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: AddressPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const [t, manzil] = await Promise.all([getTranslations({ locale, namespace: 'nav' }), getManzil(locale)]);
  return buildMetadata({ locale, path: '/aloqalar/manzil', title: t('contactAddress'), description: manzil.address });
}

export default async function AddressPage(props: AddressPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations('nav');
  const manzil = await getManzil(locale);

  return (
    <div>
      <h1 className={styles.title}>{t('contactAddress')}</h1>
      <div className={styles.map} />
      <ul className={styles.list}>
        <li><MapPin size={17} className={styles.icon} /><span>{manzil.address}</span></li>
        <li><Phone size={17} className={styles.icon} /><a href={`tel:${manzil.phone}`}>{manzil.phone}</a></li>
        <li><Mail size={17} className={styles.icon} /><a href={`mailto:${manzil.email}`}>{manzil.email}</a></li>
        <li><Clock size={17} className={styles.icon} /><span>{manzil.workingHours}</span></li>
      </ul>
    </div>
  );
}
