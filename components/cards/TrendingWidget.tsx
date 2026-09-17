import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TrendingUp } from 'lucide-react';
import type { NewsItem } from '@/types';
import styles from './TrendingWidget.module.scss';

interface TrendingWidgetProps {
  items: NewsItem[];
}

/** "Eng ko'p o'qilganlar" — hozircha so'nggi materiallar bo'yicha (real "ko'rishlar soni" keyingi bosqichda ulanadi). */
export default function TrendingWidget({ items }: TrendingWidgetProps) {
  const t = useTranslations('news');

  return (
    <div className={styles.widget}>
      <div className={styles.head}>
        <h5>{t('trending')}</h5>
        <TrendingUp size={16} className={styles.headIcon} />
      </div>

      {items.map((item) => (
        <Link key={item.id} href={`/yangiliklar/${item.rubricSlug}/${item.slug}`} className={styles.item}>
          <span className={styles.rubric}>{item.rubric.toUpperCase()}</span>
          <h4>{item.title}</h4>
        </Link>
      ))}

      <Link href="/yangiliklar" className={styles.seeAll}>{t('allNews')}</Link>
    </div>
  );
}
