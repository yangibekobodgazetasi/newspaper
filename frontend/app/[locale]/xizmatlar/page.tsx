import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { BarChart3, MessageSquareText, HelpCircle, ListChecks, Mail } from 'lucide-react';
import LinkTile from '@/components/ui/LinkTile';
import { buildMetadata } from '@/lib/seo';
import styles from '../aloqalar/page.module.scss';

interface ServicesIndexPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: ServicesIndexPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/xizmatlar', title: t('nav.services'), description: t('services.indexLead') });
}

export default function ServicesIndexPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className={styles.title}>{t('nav.services')}</h1>
      <p className={styles.lead}>{t('services.indexLead')}</p>
      <h2 className="sr-only">{t('a11y.servicesList')}</h2>
      <div className={styles.tiles}>
        <LinkTile href="/xizmatlar/sorov" label={t('nav.servicesSurvey')} description={t('services.surveyDescription')} icon={BarChart3} />
        <LinkTile href="/xizmatlar/forum" label={t('nav.servicesForum')} description={t('services.forumDescription')} icon={MessageSquareText} />
        <LinkTile href="/xizmatlar/savol-javob" label={t('nav.servicesQa')} description={t('services.qaDescription')} icon={HelpCircle} />
        <LinkTile href="/xizmatlar/ttbs" label={t('services.faqShort')} description={t('services.faqDescription')} icon={ListChecks} />
        <LinkTile href="/xizmatlar/obuna" label={t('nav.servicesSubscribe')} description={t('services.subscribeDescription')} icon={Mail} />
      </div>
    </div>
  );
}
