'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import styles from './Masthead.module.scss';

interface MastheadProps {
  /** Oxirgi son haqidagi qator, masalan "№25 (8043) · 30-iyun, 2026". Son bo'lmasa ko'rsatilmaydi. */
  issueLine?: string;
}

const LOCALE_LABELS: Record<string, string> = {
  uz: "O'zb",
  ru: 'Рус',
  en: 'Eng',
};

// Maqola detail sahifasi: /yangiliklar/[category]/[slug] — `slug` backendda har til uchun
// alohida (NewsTranslation: @@unique([locale, slug])), va public API boshqa locale'ning
// slug'ini qaytarmaydi (bu faqat admin API'da, translations[] ichida bor). Shuning uchun bu
// sahifada til almashtirilganda eski slug bilan yangi locale URL yasash noto'g'ri (mavjud
// bo'lmagan/mos kelmaydigan slug'ga olib kelishi mumkin) — xavfsiz variant: shu toifaning
// ro'yxat sahifasiga o'tish.
const NEWS_DETAIL_PATTERN = /^\/yangiliklar\/([^/]+)\/[^/]+$/;

export default function Masthead({ issueLine }: MastheadProps) {
  const t = useTranslations('masthead');
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  function switchLocale(nextLocale: string) {
    const newsDetailMatch = pathname.match(NEWS_DETAIL_PATTERN);
    const targetPathname = newsDetailMatch ? `/yangiliklar/${newsDetailMatch[1]}` : pathname;
    router.replace(targetPathname, { locale: nextLocale });
  }

  // ⌘K / Ctrl+K — qidiruv maydoniga fokus. Ko'rsatma `kbd` sifatida maydonning
  // o'zida ko'rsatiladi, shuning uchun amalda ham ishlashi kerak.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/qidiruv?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className={styles.masthead}>
      <div className={styles.inner}>
        {/* Logo + nom — joriy tildagi bosh sahifaga havola (`@/i18n/navigation` Link
            locale prefiksini o'zi qo'shadi: /uz, /ru, /en). */}
        <Link href="/" className={styles.brand} aria-label={t('homeLinkLabel')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Yangi Bekobod" className={styles.mark} />
          <div className={styles.brandText}>
            <h1 className={styles.name}>YANGI BEKOBOD</h1>
            <p className={styles.tagline}>{t('tagline')}</p>
          </div>
        </Link>

        <div className={styles.meta}>
          {/* Son ma'lumoti bazadan keladi (bkl. RootLayout). Hali birorta son
              qo'shilmagan bo'lsa qator umuman ko'rsatilmaydi — o'ylab topilgan
              raqam/sana chiqarilmaydi. */}
          {issueLine && <div className={styles.issue}>{issueLine}</div>}
          <div>{t('sinceYear')}</div>
          <div>{t('weeklySchedule')}</div>
        </div>

        <div className={styles.actions}>
          <form className={styles.search} onSubmit={handleSearchSubmit} role="search">
            <Search size={15} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
            />
            <kbd>⌘K</kbd>
          </form>
          <div className={styles.langs}>
            {routing.locales.map((locale) => (
              <button
                key={locale}
                className={activeLocale === locale ? styles.active : ''}
                onClick={() => switchLocale(locale)}
              >
                {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
