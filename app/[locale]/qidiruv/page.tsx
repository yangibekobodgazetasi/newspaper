import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import NewsCard from '@/components/news/NewsCard';
import { searchNews } from '@/lib/news';
import styles from './page.module.scss';

interface PageProps {
  params: { locale: string };
  searchParams: { q?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'search' });
  return { title: t('title'), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'search' });
  const query = (searchParams.q ?? '').trim();

  const results = query.length >= 2 ? await searchNews(query, 24, locale) : null;

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('title') }]} />
      <h1 className={styles.title}>{t('title')}</h1>
      {query && <p className={styles.lead}>{t('resultsFor', { query })}</p>}

      {query.length > 0 && query.length < 2 ? (
        <p className={styles.empty}>{t('minLength')}</p>
      ) : !results || results.items.length === 0 ? (
        <p className={styles.empty}>{t('empty')}</p>
      ) : (
        <div className={styles.grid}>
          {results.items.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </main>
  );
}
