'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import RubricChips from '@/components/ui/RubricChips';
import NewsCard from './NewsCard';
import type { NewsItem } from '@/types';
import styles from './FilterableNewsSection.module.scss';

interface FilterableNewsSectionProps {
  items: NewsItem[];
}

/** Rubrika chiplari + filtrlanadigan grid — bosh sahifadagi "Kundalik yangiliklar" bo'limi. */
export default function FilterableNewsSection({ items }: FilterableNewsSectionProps) {
  const t = useTranslations('common');
  const allLabel = t('all');
  const [active, setActive] = useState(allLabel);

  const rubrics = useMemo(() => Array.from(new Set(items.map((i) => i.rubric))), [items]);

  const filtered = useMemo(
    () => (active === allLabel ? items : items.filter((i) => i.rubric === active)),
    [items, active, allLabel]
  );

  const [first, ...rest] = filtered;

  return (
    <div>
      <RubricChips rubrics={rubrics} onChange={setActive} />

      {/* Yagona yangilik qolganda o'ng yarmi bo'sh turmasin — katta karta
          butun kenglikni egallaydi. */}
      <div className={`${styles.grid} ${rest.length === 0 ? styles.gridSingle : ''}`}>
        {first && <NewsCard news={first} size="large" />}
        {rest.length > 0 && (
          <div className={styles.subGrid}>
            {rest.slice(0, 4).map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
