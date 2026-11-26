import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import styles from './SectionHead.module.scss';

interface SectionHeadProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  dark?: boolean;
}

/**
 * Bo'lim sarlavhasi: chap tomonda h2 + qisqa urg'u chiziq, o'ngda pill ko'rinishidagi havola.
 * dark=true bo'lsa (masalan ko'k fon ustida) rang teskari bo'ladi.
 */
export default function SectionHead({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel,
  dark = false,
}: SectionHeadProps) {
  const t = useTranslations('common');

  return (
    <div className={`${styles.head} ${dark ? styles.dark : ''}`}>
      <div>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.dash} />
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {seeAllHref && (
        <Link href={seeAllHref} className={styles.seeAll}>
          {seeAllLabel ?? t('all')} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
