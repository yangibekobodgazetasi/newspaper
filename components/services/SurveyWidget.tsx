'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Survey } from '@/types';
import { voteSurvey } from '@/lib/services';
import Button from '@/components/ui/Button';
import styles from './SurveyWidget.module.scss';

interface SurveyWidgetProps {
  survey: Survey;
}

/** Client komponent — ovoz berilganda backendga POST /api/services/sorov/:id/vote yuboriladi. */
export default function SurveyWidget({ survey }: SurveyWidgetProps) {
  const t = useTranslations('services');
  const [options, setOptions] = useState(survey.options);
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = async () => {
    if (!selected || voted || submitting) return;
    setSubmitting(true);
    try {
      await voteSurvey(survey.id, selected);
      setOptions((prev) => prev.map((o) => (o.id === selected ? { ...o, votes: o.votes + 1 } : o)));
      setVoted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.question}>{survey.question}</h3>
      <div className={styles.options}>
        {options.map((option) => {
          const percent = total === 0 ? 0 : Math.round((option.votes / total) * 100);
          return (
            <label key={option.id} className={`${styles.option} ${voted ? styles.resultMode : ''}`}>
              <div className={styles.optionRow}>
                {!voted && (
                  <input
                    type="radio"
                    name="survey"
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                  />
                )}
                <span className={styles.label}>{option.label}</span>
                {voted && <span className={styles.percent}>{percent}%</span>}
              </div>
              {voted && (
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percent}%` }} />
                </div>
              )}
            </label>
          );
        })}
      </div>

      {!voted ? (
        <Button onClick={handleVote} variant="primary" size="sm">
          {t('vote')}
        </Button>
      ) : (
        <p className={styles.thanks}>{t('votedThanks', { count: total + 1 })}</p>
      )}
    </div>
  );
}
