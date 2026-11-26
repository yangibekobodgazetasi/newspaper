import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { resolveImageUrl, resolveUploadUrl } from '@/lib/api';
import { formatLocalizedDate } from '@/lib/date';
import type { Issue } from '@/types';
import styles from './IssueCard.module.scss';

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
}

/** compact=true -> arxiv gridida kichikroq, sahifaga havola qiluvchi ko'rinish */
export default function IssueCard({ issue, compact = false }: IssueCardProps) {
  const t = useTranslations('issues');
  const locale = useLocale();
  const cover = resolveImageUrl(issue.coverImage);

  const coverEl = (
    <div className={styles.cover} style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
  );

  if (compact) {
    return (
      <Link href={`/sonlar-arxivi/${issue.id}`} className={`${styles.card} ${styles.compact}`}>
        {coverEl}
        <h3 className={styles.number}>№{issue.number}</h3>
        <span className={styles.date}>{formatShort(issue.date)}</span>
      </Link>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>{t('latestEyebrow')}</span>
        <span className={styles.badge}>{t('newBadge')}</span>
      </div>
      {coverEl}
      <h3 className={styles.number}>№{issue.number} ({issue.id})</h3>
      <p className={styles.info}>
        {formatLocalizedDate(issue.date, locale)} · {t('pagesAndSize', { pages: issue.pages, fileSize: issue.fileSize })}
      </p>
      {/* PDF — statik fayl, ilova sahifasi emas: locale prefiksi qo'shilmasligi kerak.
          `resolveUploadUrl` admin orqali yuklangan faylni backend manzili bilan beradi.
          Fayl serverda bo'lmasa tugma umuman ko'rsatilmaydi — 404 beradigan havolani
          o'quvchiga taklif qilishdan ko'ra yo'qligini aytgan ma'qul. */}
      {issue.pdfAvailable ? (
        <Button href={resolveUploadUrl(issue.pdfUrl) ?? issue.pdfUrl} external variant="primary" size="sm" icon={Download} fullWidth>
          {t('download')}
        </Button>
      ) : (
        <p className={styles.unavailable}>{t('pdfUnavailable')}</p>
      )}
    </div>
  );
}

function formatShort(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
