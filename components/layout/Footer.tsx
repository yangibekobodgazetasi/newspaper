import { useTranslations } from 'next-intl';
import { ArrowUpRight, Code, User } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { navigation } from '@/data/navigation';
import styles from './Footer.module.scss';

const DEVELOPER_LINKS = {
  company: { name: 'Edex Academy', href: 'https://edexacademy.uz' },
  author: { name: 'yarmatxonov.uz', href: 'https://yarmatxonov.uz' },
} as const;

export default function Footer() {
  const t = useTranslations();

  // Footer ustunlarini navigation'dagi bo'limlardan avtomatik quramiz — DRY
  const columns = navigation.filter((item) => item.children);

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <div className={styles.brandRow}>
            {/* Footer foni to'q ko'k (`$river-deep`) — shuning uchun bu yerda logotipning
                yorug' varianti ishlatiladi (manba: `design/desktop/logo-dark.png`).
                Header'dagi `/images/logo.png` o'z joyida qoladi. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-dark.png" alt="Yangi Bekobod" className={styles.brandMark} />
            <p className={styles.brandName}>Yangi Bekobod</p>
          </div>
          <p className={styles.about}>
            {t('footer.founderLabel')}: {t('footer.founder')}<br />
            {t('footer.address')}<br />
            {t('footer.phoneLabel')}: {t('footer.phone')}<br />
            {t('footer.email')}
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.href}>
            <h2 className={styles.heading}>{t(`nav.${col.labelKey}`)}</h2>
            {col.children!.map((child) => (
              <Link key={child.href} href={child.href} className={styles.link}>
                {t(`nav.${child.labelKey}`)}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <div className={styles.credits}>
            <a className={styles.chip} href={DEVELOPER_LINKS.company.href} target="_blank" rel="noopener noreferrer">
              <Code size={13} aria-hidden="true" />
              <span className={styles.chipLabel}>{t('footer.developedByLabel')}:</span>
              {DEVELOPER_LINKS.company.name}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <a className={styles.chip} href={DEVELOPER_LINKS.author.href} target="_blank" rel="noopener noreferrer">
              <User size={13} aria-hidden="true" />
              <span className={styles.chipLabel}>{t('footer.authorLabel')}:</span>
              {DEVELOPER_LINKS.author.name}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
