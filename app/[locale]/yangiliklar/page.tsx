import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHead from '@/components/ui/SectionHead';
import NewsCard from '@/components/news/NewsCard';
import CategoryTile from '@/components/news/CategoryTile';
import { getCategories, getNewsCategoryPage, getMediaItems } from '@/lib/news';
import { buildMetadata } from '@/lib/seo';
import type { NewsItem } from '@/types';
import styles from './page.module.scss';

interface NewsIndexPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: NewsIndexPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return buildMetadata({ locale, path: '/yangiliklar', title: t('nav.news'), description: t('news.indexLead') });
}

export default async function NewsIndexPage({ params: { locale } }: NewsIndexPageProps) {
  const t = await getTranslations();
  const categories = await getCategories(locale);
  const nonGallery = categories.filter((c) => c.slug !== 'media-galereya');

  const [pages, mediaItems] = await Promise.all([
    Promise.all(nonGallery.map((c) => getNewsCategoryPage(c.slug, 24, locale))),
    getMediaItems(),
  ]);

  const counts = new Map(nonGallery.map((c, i) => [c.slug, pages[i].total]));
  counts.set('media-galereya', mediaItems.length);
  const allItems: NewsItem[] = pages.flatMap((p) => p.items);
  const latest = allItems.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)).slice(0, 4);

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('nav.news') }]} />
      <h1 className={styles.title}>{t('nav.news')}</h1>
      <p className={styles.lead}>
        {t('news.indexLead')}
      </p>

      <div className={styles.tiles}>
        {categories.map((cat) => (
          <CategoryTile
            key={cat.slug}
            slug={cat.slug}
            label={cat.label}
            description={cat.description}
            count={counts.get(cat.slug) ?? 0}
          />
        ))}
      </div>

      <SectionHead title={t('news.latestMaterials')} />
      <div className={styles.grid}>
        {latest.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </main>
  );
}
