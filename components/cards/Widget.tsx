import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';
import { Play, ChevronRight } from 'lucide-react';
import type { WidgetItem } from '@/types';
import styles from './Widget.module.scss';

interface WidgetProps {
  title: string;
  items?: WidgetItem[];
  children?: ReactNode;
  variant?: 'default' | 'video' | 'timeline';
  seeAllHref?: string;
}

/** Umumiy sidebar vidjet qobig'i — 3 ko'rinishda: oddiy ro'yxat, video (play icon), timeline (E'lonlar). */
export default function Widget({ title, items, children, variant = 'default', seeAllHref }: WidgetProps) {
  const t = useTranslations('common');

  return (
    <div className={styles.widget}>
      <div className={styles.head}>
        <h5 className={styles.heading}>{title}</h5>
        {seeAllHref && (
          <Link href={seeAllHref} className={styles.seeAll} aria-label={t('all')}>
            <ChevronRight size={15} />
          </Link>
        )}
      </div>

      {items?.map((item) => (
        <div
          key={item.href}
          className={`${styles.item} ${variant === 'timeline' ? styles.timelineItem : ''} ${item.announce ? styles.announce : ''}`}
        >
          {variant === 'video' && (
            <span className={styles.playThumb}>
              <Play size={11} fill="currentColor" />
            </span>
          )}
          <div className={styles.itemBody}>
            <Link href={item.href}>{item.title}</Link>
            {item.meta && <span className={styles.meta}>{item.meta}</span>}
          </div>
        </div>
      ))}
      {children}
    </div>
  );
}
