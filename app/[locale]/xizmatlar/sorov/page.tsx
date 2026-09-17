import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SurveyWidget from '@/components/services/SurveyWidget';
import { getSurvey } from '@/lib/services';
import { buildMetadata } from '@/lib/seo';
import styles from '../../aloqalar/page.module.scss';

interface SurveyPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: SurveyPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/xizmatlar/sorov', title: t('nav.servicesSurvey'), description: t('services.surveyLead') });
}

export default async function SurveyPage() {
  const t = await getTranslations();
  const survey = await getSurvey();
  return (
    <div>
      <h1 className={styles.title}>{t('nav.servicesSurvey')}</h1>
      <p className={styles.lead}>{t('services.surveyLead')}</p>
      <SurveyWidget survey={survey} />
    </div>
  );
}
