'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight, ArrowRight, Calendar } from 'lucide-react';
import CategoryBadge from '@/components/ui/CategoryBadge';
import IssueCard from './IssueCard';
import { resolveImageUrl } from '@/lib/api';
import type { NewsItem, Issue } from '@/types';
import styles from './Hero.module.scss';

interface HeroProps {
  slides: NewsItem[]; // "Bosh materiallar" (featured=true) — bittadan ko'p bo'lsa karusel
  latestIssue: Issue;
  sideStories: NewsItem[];
}

const AUTOPLAY_MS = 7000;

export default function Hero({ slides, latestIssue, sideStories }: HeroProps) {
  const t = useTranslations('common');
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slide) return null;

  const bgImage = resolveImageUrl(slide.coverImage);
  const initials = slide.author
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section className={styles.hero}>
      <div className={styles.main}>
        <div
          className={`${styles.image} ${!bgImage ? styles[slide.cover] : ''}`}
          style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
        >
          <div className={styles.overlay} />
          <div className={styles.content}>
            <div className={styles.topRow}>
              <CategoryBadge>{slide.rubric}</CategoryBadge>
              <span className={styles.date}><Calendar size={12} /> {formatShortDate(slide.publishedAt)}</span>
            </div>

            <h2 className={styles.title}>{slide.title}</h2>
            <p className={styles.excerpt}>{slide.excerpt}</p>

            <div className={styles.footerRow}>
              <div className={styles.authorRow}>
                <span className={styles.avatar}>{initials}</span>
                <span>{slide.author}</span>
              </div>

              {/* Tugma va karusel boshqaruvi bitta oqimda — ustma-ust tushmaydi */}
              <div className={styles.footerActions}>
                <Link href={`/yangiliklar/${slide.rubricSlug}/${slide.slug}`} className={styles.readMore}>
                  {t('readMore')} <ArrowRight size={15} />
                </Link>

                {slides.length > 1 && (
                  <div className={styles.carouselControls}>
                    <div className={styles.dots}>
                      {slides.map((s, i) => (
                        <button
                          key={s.id}
                          className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                          onClick={() => setActive(i)}
                          aria-label={t('slideLabel', { number: i + 1 })}
                        />
                      ))}
                    </div>
                    <div className={styles.arrows}>
                      <button onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)} aria-label={t('previous')}>
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setActive((i) => (i + 1) % slides.length)} aria-label={t('next')}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <IssueCard issue={latestIssue} />
        {/* {sideStories.map((story) => {
          const thumb = resolveImageUrl(story.coverImage);
          // return (
          //   <Link key={story.slug} href={`/yangiliklar/${story.rubricSlug}/${story.slug}`} className={styles.sideStory}>
          //     <div
          //       className={`${styles.sideThumb} ${!thumb ? styles[story.cover] : ''}`}
          //       style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
          //     />
          //     <div>
          //       <CategoryBadge className={styles.sideBadge}>{story.rubric}</CategoryBadge>
          //       <h4>{story.title}</h4>
          //     </div>
          //   </Link>
          // );
        })} */}
      </div>
    </section>
  );
}

function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
  return `${parseInt(d, 10)}-${months[parseInt(m, 10) - 1]}`;
}
