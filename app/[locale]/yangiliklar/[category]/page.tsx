import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import NewsCard from '@/components/news/NewsCard';
import AnnouncementCard from '@/components/news/AnnouncementCard';
import GalleryItem from '@/components/news/GalleryItem';
import { getCategories, isValidCategory, getCategoryMeta, getNewsByCategory, getMediaItems } from '@/lib/news';
import { buildMetadata } from '@/lib/seo';
import type { NewsCategorySlug } from '@/types';
import styles from './page.module.scss';

interface PageProps {
  params: Promise<{ locale: string; category: string }>;
}

// Statik eksport uchun barcha toifalarni oldindan generatsiya qilamiz (backend'dan dinamik olinadi).
// `params` — ota segment ([locale] layout'idagi generateStaticParams) natijasi, har bir locale uchun alohida chaqiriladi.
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const categories = await getCategories(params.locale);
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const meta = await getCategoryMeta(params.category, params.locale);
  if (!meta) return {};
  // Toifa slug'i (NewsCategory.slug) locale'dan mustaqil — barcha tillar uchun bir xil yo'l.
  return buildMetadata({
    locale: params.locale,
    path: `/yangiliklar/${params.category}`,
    title: meta.label,
    description: meta.description,
  });
}

export default async function NewsCategoryPage(props: PageProps) {
  const params = await props.params;
  const { locale, category } = params;
  const t = await getTranslations('nav');
  const tA11y = await getTranslations('a11y');
  const meta = await getCategoryMeta(category, locale);

  if (!meta) {
    notFound();
  }

  const slug = category as NewsCategorySlug;

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('news'), href: '/yangiliklar' }, { label: meta.label }]} />
      <h1 className={styles.title}>{meta.label}</h1>
      <p className={styles.lead}>{meta.description}</p>
      <h2 className="sr-only">{tA11y('newsList')}</h2>

      {slug === 'media-galereya' ? (
        <MediaGalleryList />
      ) : slug === 'elonlar' ? (
        <AnnouncementList slug={slug} locale={locale} />
      ) : (
        <StandardNewsList slug={slug} locale={locale} />
      )}
    </main>
  );
}

async function StandardNewsList({ slug, locale }: { slug: NewsCategorySlug; locale: string }) {
  const items = await getNewsByCategory(slug, 24, locale);

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}

async function AnnouncementList({ slug, locale }: { slug: NewsCategorySlug; locale: string }) {
  const items = await getNewsByCategory(slug, 24, locale);

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.announceList}>
      {items.map((item) => (
        <AnnouncementCard key={item.id} item={item} />
      ))}
    </div>
  );
}

async function MediaGalleryList() {
  const mediaItems = await getMediaItems();

  if (mediaItems.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.galleryGrid}>
      {mediaItems.map((item) => (
        <GalleryItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('news');
  return <p className={styles.empty}>{t('noItems')}</p>;
}
