import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import styles from './Breadcrumbs.module.scss';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

/** Barcha ichki sahifalarda ishlatiladigan umumiy "Bosh sahifa / ... " yo'lchasi. */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useTranslations();
  const all: Crumb[] = [{ label: t('nav.home'), href: '/' }, ...items];

  return (
    <nav className={styles.trail} aria-label={t('common.breadcrumbs')}>
      {all.map((crumb, i) => {
        const isLast = i === all.length - 1;
        return (
          <span key={i} className={styles.crumb}>
            {crumb.href && !isLast ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className={styles.current}>{crumb.label}</span>
            )}
            {!isLast && <ChevronRight size={12} className={styles.sep} />}
          </span>
        );
      })}
    </nav>
  );
}
