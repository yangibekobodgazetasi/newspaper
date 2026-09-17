import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CategoryBadge from '@/components/ui/CategoryBadge';
import SectionHead from '@/components/ui/SectionHead';
import NewsCard from '@/components/news/NewsCard';
import { resolveImageUrl } from '@/lib/api';
import {
  getCategories,
  getCategoryMeta,
  getNewsByCategory,
  getNewsBySlug,
  getRelatedNews,
  formatNewsDate,
} from '@/lib/news';
import { buildMetadata } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import type { NewsCategorySlug } from '@/types';
import styles from './page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface PageProps {
  params: Promise<{ locale: string; category: string; slug: string }>;
}

// Media-galereya toifasida alohida maqola sahifasi yo'q — faqat qolgan toifalar uchun generatsiya qilamiz.
// `slug` har til uchun alohida (backend: @@unique([locale, slug])), shuning uchun ro'yxatni
// ota segmentdan (`[locale]` layout) kelgan locale bilan olish shart — aks holda boshqa tillarda
// noto'g'ri (masalan uz) slug'lar bilan statik sahifa generatsiya qilingan bo'lardi.
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const categories = (await getCategories(params.locale)).filter((c) => c.slug !== 'media-galereya');
  const lists = await Promise.all(categories.map((c) => getNewsByCategory(c.slug, 24, params.locale)));

  return categories.flatMap((c, i) => lists[i].map((n) => ({ category: c.slug, slug: n.slug })));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const meta = await getCategoryMeta(params.category, params.locale);
  if (!meta) return {};
  const item = await getNewsBySlug(params.category as NewsCategorySlug, params.slug, params.locale);
  if (!item) return {};

  // NewsTranslation.slug har locale uchun alohida (@@unique([locale, slug])), shuning uchun
  // boshqa tillar uchun havolani slug'ni "taxmin qilib" qurish mumkin emas. Public detail
  // endpoint endi `slugs` xaritasini ham qaytaradi — shu bilan hreflang aniq maqolaga
  // ishora qiladi. Agar biror tilda tarjima YO'Q bo'lsa, o'sha til uchun (va faqat o'sha
  // til uchun) toifa ro'yxatiga tushamiz — noto'g'ri slug o'ylab topilmaydi.
  const currentPath = `/yangiliklar/${params.category}/${params.slug}`;
  const categoryPath = `/yangiliklar/${params.category}`;
  const alternatePaths: Record<string, string> = {};
  for (const l of routing.locales) {
    const localeSlug = l === params.locale ? params.slug : item.slugs?.[l];
    alternatePaths[l] = localeSlug ? `/yangiliklar/${params.category}/${localeSlug}` : categoryPath;
  }

  return buildMetadata({
    locale: params.locale,
    path: currentPath,
    alternatePaths,
    title: item.title,
    description: item.excerpt,
    image: resolveImageUrl(item.coverImage),
    type: 'article',
    publishedTime: new Date(item.publishedAt).toISOString(),
    authors: item.author ? [item.author] : undefined,
  });
}

export default async function NewsArticlePage(props: PageProps) {
  const params = await props.params;
  const { locale, category, slug } = params;
  const t = await getTranslations();
  const meta = await getCategoryMeta(category, locale);

  if (!meta || category === 'media-galereya') {
    notFound();
  }

  const catSlug = category as NewsCategorySlug;
  const item = await getNewsBySlug(catSlug, slug, locale);

  if (!item) {
    notFound();
  }

  const related = await getRelatedNews(item, 3, locale);
  const cover = resolveImageUrl(item.coverImage);

  return (
    <main className={styles.main}>
      <Breadcrumbs
        items={[
          { label: t('nav.news'), href: '/yangiliklar' },
          { label: meta!.label, href: `/yangiliklar/${catSlug}` },
          { label: item.title },
        ]}
      />

      <div className={styles.layout}>
        <article className={styles.article}>
          <CategoryBadge>{item.rubric}</CategoryBadge>
          <h1 className={styles.title}>{item.title}</h1>
          <div className={styles.meta}>
            <span>{formatNewsDate(item.publishedAt)}</span>
            <span>{item.author}</span>
          </div>

          <div
            className={`${styles.cover} ${!cover ? styles[item.cover] : ''}`}
            style={cover ? { backgroundImage: `url(${cover})` } : undefined}
          />

          <div className={styles.body}>
            {(item.body || item.excerpt).split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <aside className={styles.sidebar}>
            <SectionHead title={t('news.related')} />
            <div className={styles.relatedList}>
              {related.map((r) => (
                <NewsCard key={r.id} news={r} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
