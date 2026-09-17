'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './RubricChips.module.scss';

interface RubricChipsProps {
  rubrics: string[];
  onChange?: (rubric: string) => void;
}

export default function RubricChips({ rubrics, onChange }: RubricChipsProps) {
  const t = useTranslations('common');
  const allLabel = t('all');
  const [active, setActive] = useState(allLabel);

  const handleClick = (rubric: string) => {
    setActive(rubric);
    onChange?.(rubric);
  };

  return (
    <div className={styles.strip}>
      {[allLabel, ...rubrics].map((rubric) => (
        <button
          key={rubric}
          className={`${styles.chip} ${active === rubric ? styles.active : ''}`}
          onClick={() => handleClick(rubric)}
        >
          {rubric}
        </button>
      ))}
    </div>
  );
}
