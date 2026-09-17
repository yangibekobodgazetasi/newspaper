import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import type { NewsCategorySlug } from '@/types';
import styles from './CategoryTile.module.scss';

interface CategoryTileProps {
  slug: NewsCategorySlug;
  label: string;
  description: string;
  count: number;
}

export default function CategoryTile({ slug, label, description, count }: CategoryTileProps) {
  const t = useTranslations('news');

  return (
    <Link href={`/yangiliklar/${slug}`} className={styles.tile}>
      <div>
        <h4 className={styles.label}>{label}</h4>
        <p className={styles.desc}>{description}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.count}>{t('materialsCount', { count })}</span>
        <ArrowRight size={15} />
      </div>
    </Link>
  );
}
