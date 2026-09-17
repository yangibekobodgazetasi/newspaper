import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import NewQuestionForm from '@/components/services/NewQuestionForm';
import QuestionItem from '@/components/services/QuestionItem';
import { getQuestions } from '@/lib/services';
import { buildMetadata } from '@/lib/seo';
import styles from '../../aloqalar/page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface QAPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: QAPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/xizmatlar/savol-javob', title: t('nav.servicesQa'), description: t('services.qaLead') });
}

export default async function QAPage() {
  const t = await getTranslations();
  const questions = await getQuestions();
  return (
    <div>
      <h1 className={styles.title}>{t('nav.servicesQa')}</h1>
      <p className={styles.lead}>{t('services.qaLead')}</p>
      <NewQuestionForm />
      <div>
        {questions.map((q) => (
          <QuestionItem key={q.id} item={q} />
        ))}
      </div>
    </div>
  );
}
