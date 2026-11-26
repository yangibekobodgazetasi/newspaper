import { useLocale, useTranslations } from 'next-intl';
import { HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import type { QuestionAnswer } from '@/types';
import { formatRelativeDate } from '@/lib/services';
import styles from './QuestionItem.module.scss';

export default function QuestionItem({ item }: { item: QuestionAnswer }) {
  const t = useTranslations('services');
  const locale = useLocale();

  return (
    <div className={styles.item}>
      <div className={styles.q}>
        <HelpCircle size={16} className={styles.qIcon} strokeWidth={1.8} />
        <div>
          <p className={styles.qText}>{item.question}</p>
          <div className={styles.meta}>
            <span>{item.askedBy}</span>
            <span>{formatRelativeDate(item.createdAt, locale)}</span>
            {item.status === 'answered' ? (
              <span className={styles.answered}><CheckCircle2 size={12} /> {t('answered')}</span>
            ) : (
              <span className={styles.pending}><Clock size={12} /> {t('pending')}</span>
            )}
          </div>
        </div>
      </div>
      {item.answer && (
        <div className={styles.a}>
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
}
