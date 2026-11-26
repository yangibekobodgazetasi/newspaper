'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BarChart3 } from 'lucide-react';
import styles from './StatsWidget.module.scss';

interface StatsWidgetProps {
  stats: { label: string; value: number }[];
}

const ANIMATION_MS = 1400;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * "Haftalik statistika" vidjeti — sonlar `page.tsx` da backend'dan (`/api/home/stats`)
 * olib kelinadi, bu komponent faqat ularni ko'rsatadi.
 *
 * Foydalanuvchi shu bo'limga skroll qilib yetganda (IntersectionObserver) sonlar
 * 0'dan haqiqiy qiymatgacha animatsiya bilan sanaladi — faqat BIR MARTA (qayta
 * yuqoriga/pastga skroll qilinganda takrorlanmaydi). `prefers-reduced-motion`
 * yoqilgan bo'lsa animatsiyasiz to'g'ridan-to'g'ri yakuniy son ko'rsatiladi.
 */
export default function StatsWidget({ stats }: StatsWidgetProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [displayValues, setDisplayValues] = useState<number[]>(() => stats.map(() => 0));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValues(stats.map((s) => s.value));
      return;
    }

    function animate() {
      hasAnimatedRef.current = true;
      const startTime = performance.now();
      function tick(now: number) {
        const progress = Math.min((now - startTime) / ANIMATION_MS, 1);
        const eased = easeOutCubic(progress);
        setDisplayValues(stats.map((s) => Math.round(s.value * eased)));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimatedRef.current) return;
        observer.disconnect();
        animate();
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // `stats` — server komponentdan bir martalik props, animatsiyani qayta
    // ishga tushirmaslik uchun ataylab dependency'ga qo'shilmagan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatter = new Intl.NumberFormat(locale);

  return (
    <div className={styles.widget} ref={containerRef}>
      <BarChart3 size={14} />
      <span className={styles.label}>{t('weeklyStats')}</span>
      <div className={styles.grid}>
        {stats.map((s, i) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.value}>{formatter.format(displayValues[i])}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
