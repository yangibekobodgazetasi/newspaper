import { Link } from '@/i18n/navigation';
import { ArrowRight, Calendar } from 'lucide-react';
import CategoryBadge from '@/components/ui/CategoryBadge';
import { resolveImageUrl } from '@/lib/api';
import type { NewsItem } from '@/types';
import styles from './NewsCard.module.scss';

interface NewsCardProps {
  news: NewsItem;
  size?: 'default' | 'large';
}

export default function NewsCard({ news, size = 'default' }: NewsCardProps) {
  const image = resolveImageUrl(news.coverImage);
  const imageStyle = image ? { backgroundImage: `url(${image})` } : undefined;
  const imageClass = !image ? styles[news.cover] : '';

  if (size === 'large') {
    return (
      <Link href={`/yangiliklar/${news.rubricSlug}/${news.slug}`} className={styles.large}>
        <div className={`${styles.largeImage} ${imageClass}`} style={imageStyle}>
          <div className={styles.largeOverlay} />
          <div className={styles.largeBadge}><CategoryBadge>{news.rubric}</CategoryBadge></div>
          <div className={styles.largeContent}>
            <h3>{news.title}</h3>
            <p>{news.excerpt}</p>
            <div className={styles.largeFooter}>
              <span><Calendar size={12} /> {formatDate(news.publishedAt)}</span>
              <span className={styles.largeArrow}><ArrowRight size={14} /></span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/yangiliklar/${news.rubricSlug}/${news.slug}`} className={styles.card}>
      <div className={`${styles.image} ${imageClass}`} style={imageStyle}>
        <div className={styles.imageBadge}><CategoryBadge>{news.rubric}</CategoryBadge></div>
      </div>
      <h3 className={styles.title}>{news.title}</h3>
      <p className={styles.excerpt}>{news.excerpt}</p>
      <div className={styles.meta}>
        <time dateTime={news.publishedAt}>{formatDate(news.publishedAt)}</time>
      </div>
    </Link>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
