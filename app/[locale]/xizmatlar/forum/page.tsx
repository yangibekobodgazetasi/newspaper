import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import NewTopicForm from '@/components/services/NewTopicForm';
import ForumTopicItem from '@/components/services/ForumTopicItem';
import { getForumTopics } from '@/lib/services';
import { buildMetadata } from '@/lib/seo';
import styles from '../../aloqalar/page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface ForumPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: ForumPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/xizmatlar/forum', title: t('nav.servicesForum'), description: t('services.forumLead') });
}

export default async function ForumPage() {
  const t = await getTranslations();
  const topics = await getForumTopics();
  return (
    <div>
      <h1 className={styles.title}>{t('nav.servicesForum')}</h1>
      <p className={styles.lead}>{t('services.forumLead')}</p>
      <NewTopicForm />
      <div>
        {topics.map((topic) => (
          <ForumTopicItem key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
