'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHead from '@/components/ui/SectionHead';
import { resolveImageUrl } from '@/lib/api';
import type { HomePromo, Issue } from '@/types';
import styles from './ArchiveStrip.module.scss';

interface ArchiveStripProps {
  issues: Issue[];
  /** Admin paneldan keladigan promo kartasi. Berilmasa/bo'sh bo'lsa standart ko'rinish. */
  promo?: HomePromo;
}

export default function ArchiveStrip({ issues, promo }: ArchiveStripProps) {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const promoImage = resolveImageUrl(promo?.image);

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <SectionHead
        title={t('issues.archiveTitle')}
        subtitle={t('issues.archiveSubtitle')}
        seeAllHref="/sonlar-arxivi"
        seeAllLabel={t('issues.seeMore')}
      />

      <div className={styles.layout}>
        <div className={styles.scrollWrap}>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scroll(-1)} aria-label={t('common.previous')}>
            <ChevronLeft size={16} />
          </button>

          <div className={styles.scroll} ref={scrollRef}>
            {issues.map((issue) => {
              const cover = resolveImageUrl(issue.coverImage);
              return (
                <Link key={issue.id} href={`/sonlar-arxivi/${issue.id}`} className={styles.item}>
                  <div
                    className={styles.cover}
                    style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                  />
                  <div className={styles.num}>№{issue.number}</div>
                  <div className={styles.d}>{formatShort(issue.date)}</div>
                </Link>
              );
            })}
          </div>

          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scroll(1)} aria-label={t('common.next')}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Promo kartasi admin paneldan boshqariladi (`home:promo`). Sarlavha yoki fon
            rasmi kiritilmagan bo'lsa — avvalgi standart holat saqlanadi: tarjima
            fayllaridagi matn va CSS gradient fon. */}
        <div className={styles.promo}>
          <div
            className={styles.promoImage}
            style={promoImage ? { backgroundImage: `url(${promoImage})` } : undefined}
          />
          <div className={styles.promoOverlay} />
          <div className={styles.promoContent}>
            <h3>{promo?.heading || t('issues.promoHeading')}</h3>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatShort(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
