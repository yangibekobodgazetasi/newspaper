import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Download } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHead from '@/components/ui/SectionHead';
import Button from '@/components/ui/Button';
import NewsCard from '@/components/news/NewsCard';
import { getSortedIssues, getIssueById, getArticlesForIssue, formatNewsDate } from '@/lib/issues';
import { resolveImageUrl, resolveUploadUrl } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface PageProps {
  params: { locale: string; id: string };
}

export async function generateStaticParams() {
  const issues = await getSortedIssues();
  return issues.map((issue) => ({ id: issue.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const issue = await getIssueById(params.id);
  if (!issue) return {};
  const t = await getTranslations({ locale: params.locale });
  return buildMetadata({
    locale: params.locale,
    path: `/sonlar-arxivi/${issue.id}`,
    title: `№${issue.number} (${issue.id})`,
    description: t('issues.pagesAndSize', { pages: issue.pages, fileSize: issue.fileSize }),
    image: resolveImageUrl(issue.coverImage),
  });
}

export default async function IssueDetailPage({ params }: PageProps) {
  const t = await getTranslations();
  const issue = await getIssueById(params.id);
  if (!issue) notFound();

  const articles = await getArticlesForIssue(issue!);
  // Admin panelda yuklangan muqova. Bo'lmasa `.cover` o'zining gradient foni bilan qoladi.
  const cover = resolveImageUrl(issue!.coverImage);

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('nav.issues'), href: '/sonlar-arxivi' }, { label: `№${issue!.number} (${issue!.id})` }]} />

      <div className={styles.layout}>
        <div
          className={styles.cover}
          style={cover ? { backgroundImage: `url(${cover})` } : undefined}
        />
        <div>
          <h1 className={styles.title}>№{issue!.number} ({issue!.id})</h1>
          <p className={styles.date}>{formatNewsDate(issue!.date)}</p>
          <p className={styles.specs}>{t('issues.pagesAndSize', { pages: issue!.pages, fileSize: issue!.fileSize })}</p>
          {/* PDF — statik fayl, ilova sahifasi emas: locale prefiksi qo'shilmasligi kerak.
              Fayl serverda bo'lmasa buzilgan havola o'rniga tushuntirish ko'rsatiladi. */}
          {issue!.pdfAvailable ? (
            <Button href={resolveUploadUrl(issue!.pdfUrl) ?? issue!.pdfUrl} external variant="primary" icon={Download}>
              {t('issues.download')}
            </Button>
          ) : (
            <p className={styles.unavailable}>{t('issues.pdfUnavailable')}</p>
          )}
        </div>
      </div>

      {articles.length > 0 && (
        <>
          <SectionHead title={t('issues.materialsForIssue')} />
          <div className={styles.grid}>
            {articles.map((article) => (
              <NewsCard key={article.id} news={article} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
