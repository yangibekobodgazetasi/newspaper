'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/types';
import styles from './FaqAccordion.module.scss';

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={styles.item}>
            <button
              className={styles.question}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            </button>
            {isOpen && <div className={styles.answer}>{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
