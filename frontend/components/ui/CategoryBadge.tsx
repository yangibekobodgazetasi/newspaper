import { getBadgeIndex } from '@/lib/badgeColor';
import styles from './CategoryBadge.module.scss';

interface CategoryBadgeProps {
  children: string;
  className?: string;
}

/** Rubrika/toifa nomini rang-barang chip sifatida ko'rsatadi — rang matn asosida barqaror. */
export default function CategoryBadge({ children, className }: CategoryBadgeProps) {
  const index = getBadgeIndex(children);
  return (
    <span className={`${styles.badge} ${styles[`badge${index}`]} ${className || ''}`}>
      {children}
    </span>
  );
}
