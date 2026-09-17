import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CalendarDays } from 'lucide-react';
import { getQabulJadvali } from '@/lib/contact';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface ReceptionSchedulePageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: ReceptionSchedulePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/aloqalar/qabul-jadvali', title: t('nav.contactSchedule'), description: t('contact.scheduleLead') });
}

export default async function ReceptionSchedulePage({ params: { locale } }: ReceptionSchedulePageProps) {
  const t = await getTranslations();
  const schedule = await getQabulJadvali(locale);

  return (
    <div>
      <h1 className={styles.title}>{t('nav.contactSchedule')}</h1>
      <p className={styles.lead}>{t('contact.scheduleLead')}</p>
      <div className={styles.list}>
        {schedule.map((slot) => (
          <div key={slot.day} className={styles.row}>
            <CalendarDays size={18} className={styles.icon} strokeWidth={1.7} />
            <div>
              <h4>{slot.day} <span className={styles.hours}>{slot.hours}</span></h4>
              <p>{slot.person}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
