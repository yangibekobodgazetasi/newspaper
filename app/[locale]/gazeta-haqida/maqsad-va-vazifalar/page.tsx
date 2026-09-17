import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import AboutArticle from '@/components/about/AboutArticle';
import { getAboutContent } from '@/lib/about';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface GoalsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: GoalsPageProps): Promise<Metadata> {
  const content = await getAboutContent('maqsad-va-vazifalar', locale);
  return buildMetadata({ locale, path: '/gazeta-haqida/maqsad-va-vazifalar', title: content.title, description: content.intro });
}

export default async function GoalsPage({ params: { locale } }: GoalsPageProps) {
  const content = await getAboutContent('maqsad-va-vazifalar', locale);
  return (
    <AboutArticle {...content}>
      {content.goals && (
        <ul className={styles.goals}>
          {content.goals.map((goal, i) => (
            <li key={i}>
              <CheckCircle2 size={18} className={styles.icon} strokeWidth={1.7} />
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      )}
    </AboutArticle>
  );
}
