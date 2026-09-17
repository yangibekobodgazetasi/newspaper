import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { navigation } from '@/data/navigation';
import styles from './Footer.module.scss';

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
            <h5 className={styles.brandName}>Yangi Bekobod</h5>
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
            <h5 className={styles.heading}>{t(`nav.${col.labelKey}`)}</h5>
            {col.children!.map((child) => (
              <Link key={child.href} href={child.href} className={styles.link}>
                {t(`nav.${child.labelKey}`)}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
        <span className={styles.dot} aria-hidden="true">·</span>
        <span>{t('footer.developedBy')}</span>
      </div>
    </footer>
  );
}
