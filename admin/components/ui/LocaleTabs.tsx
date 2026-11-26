'use client';

import { useState, type ReactNode } from 'react';
import type { Language } from '@/types';
import styles from '../ui/Tabs.module.scss';

interface LocaleTabsProps {
  languages: Language[];
  /** Har bir til uchun input maydonlari — barcha tillar doim DOM'da qoladi (faqat CSS bilan yashiriladi),
   * shunda forma submit qilinganda FormData barcha tillarning qiymatlarini o'z ichiga oladi. */
  children: (locale: string, isDefault: boolean) => ReactNode;
}

/**
 * News/Category/Team formalarida "🇺🇿 UZ / 🇷🇺 RU / 🇺🇸 EN" kabi til tablarini
 * ko'rsatadi. Oddiy `Tabs` komponentidan farqi: faqat faol tab emas, BARCHA
 * tillarning input maydonlari doim mount qilingan bo'ladi (`display:none` bilan
 * yashiriladi) — aks holda forma submit qilinganda ko'rinmas tab'lardagi
 * qiymatlar FormData'ga tushmay qolardi.
 */
export default function LocaleTabs({ languages, children }: LocaleTabsProps) {
  const defaultLocale = languages.find((l) => l.isDefault)?.code ?? languages[0]?.code;
  const [active, setActive] = useState(defaultLocale);

  return (
    <div>
      <div className={styles.list}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`${styles.tab} ${active === lang.code ? styles.active : ''}`}
            onClick={() => setActive(lang.code)}
          >
            {lang.code.toUpperCase()}
            {lang.isDefault && ' *'}
          </button>
        ))}
      </div>
      {languages.map((lang) => (
        <div key={lang.code} style={{ display: active === lang.code ? 'block' : 'none' }}>
          {children(lang.code, lang.isDefault)}
        </div>
      ))}
    </div>
  );
}
