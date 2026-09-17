import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import IssueCard from '@/components/cards/IssueCard';
import { getSortedIssues } from '@/lib/issues';
import { buildMetadata } from '@/lib/seo';
import type { Issue } from '@/types';
import styles from './page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface IssuesArchivePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: IssuesArchivePageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/sonlar-arxivi', title: t('nav.issues'), description: t('issues.archiveLead') });
}

export default async function IssuesArchivePage(props: IssuesArchivePageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  const issues = await getSortedIssues();

  const byYear = issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    const year = issue.date.slice(0, 4);
    (acc[year] ||= []).push(issue);
    return acc;
  }, {});

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('nav.issues') }]} />
      <h1 className={styles.title}>{t('nav.issues')}</h1>
      <p className={styles.lead}>
        {t('issues.archiveLead')}
      </p>

      {Object.entries(byYear)
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([year, yearIssues]) => (
          <section key={year} className={styles.yearBlock}>
            <h2 className={styles.year}>{t('issues.yearHeading', { year })}</h2>
            <div className={styles.grid}>
              {yearIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} compact />
              ))}
            </div>
          </section>
        ))}
    </main>
  );
}
