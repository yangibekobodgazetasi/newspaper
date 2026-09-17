import { Link } from '@/i18n/navigation';
import { Megaphone } from 'lucide-react';
import type { NewsItem } from '@/types';
import { formatNewsDate } from '@/lib/news';
import styles from './AnnouncementCard.module.scss';

interface AnnouncementCardProps {
  item: NewsItem;
}

/** E'lonlar ro'yxati uchun — NewsCard'dan farqli, rasmsiz, ixcham qator ko'rinish. */
export default function AnnouncementCard({ item }: AnnouncementCardProps) {
  return (
    <Link href={`/yangiliklar/elonlar/${item.slug}`} className={styles.item}>
      <Megaphone size={18} className={styles.icon} strokeWidth={1.7} />
      <div className={styles.body}>
        <h4 className={styles.title}>{item.title}</h4>
        <p className={styles.excerpt}>{item.excerpt}</p>
      </div>
      <time className={styles.date} dateTime={item.publishedAt}>
        {formatNewsDate(item.publishedAt)}
      </time>
    </Link>
  );
}
