import type { MediaItem } from '@/types';
import { formatNewsDate } from '@/lib/news';
import { resolveImageUrl } from '@/lib/api';
import styles from './GalleryItem.module.scss';

interface GalleryItemProps {
  item: MediaItem;
}

export default function GalleryItem({ item }: GalleryItemProps) {
  const image = resolveImageUrl(item.imageUrl);

  return (
    <figure className={styles.figure}>
      <div
        className={`${styles.image} ${!image ? styles[item.cover] : ''}`}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <figcaption className={styles.caption}>
        <span>{item.caption}</span>
        <time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
      </figcaption>
    </figure>
  );
}
