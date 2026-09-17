import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Facebook, Instagram, Youtube } from './SocialIcons';
import styles from './UtilityBar.module.scss';

const SOCIAL_LINKS = [
  { href: 'https://t.me/yangibekobod', icon: Send, label: 'Telegram' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
];

interface UtilityBarProps {
  quote?: string;
  quoteAuthor?: string;
}

export default function UtilityBar({
  quote = "Vorislik faqat faxrlanish emas, vorislik bu ulkan mas'uliyat hamdir!",
  quoteAuthor = 'Shavkat Mirziyoyev',
}: UtilityBarProps) {
  const t = useTranslations('utilityBar');

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.institution}>{t('institution')}</span>
        {quote && (
          <p className={styles.quote}>
            &ldquo;{quote}&rdquo; — {quoteAuthor}
          </p>
        )}
        <div className={styles.social}>
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
              <s.icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
