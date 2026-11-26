'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { askQuestion } from '@/lib/services';
import { useFormErrors } from '@/hooks/useFormErrors';
import { getVisitorHash } from '@/lib/visitor';
import styles from './NewQuestionForm.module.scss';

export default function NewQuestionForm() {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { errors, validate, clearError } = useFormErrors({
    question: { required: true },
    askedBy: { required: true },
    email: { required: true, email: true },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !validate(e.currentTarget, {
        required: t('common.validation.required'),
        invalidEmail: t('common.validation.invalidEmail'),
        invalidPattern: t('common.validation.invalidPattern'),
      })
    ) {
      return;
    }

    setStatus('loading');

    const form = new FormData(e.currentTarget);
    try {
      await askQuestion({
        question: String(form.get('question')),
        askedBy: String(form.get('askedBy')),
        email: String(form.get('email') || '') || undefined,
        visitorHash: getVisitorHash() || undefined,
      });
      setStatus('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('common.genericError'));
      setStatus('error');
    }
  };

  if (status === 'done') {
    return <p className={styles.success}>{t('services.questionSubmitted')}</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <textarea
          className={`${styles.textarea} ${errors.question ? styles.invalid : ''}`}
          name="question"
          placeholder={t('services.questionPlaceholder')}
          rows={3}
          onChange={() => clearError('question')}
        />
        {errors.question && <span className={styles.fieldError}>{errors.question}</span>}
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <input
            className={`${styles.input} ${errors.askedBy ? styles.invalid : ''}`}
            name="askedBy"
            type="text"
            placeholder={t('services.namePlaceholder')}
            onChange={() => clearError('askedBy')}
          />
          {errors.askedBy && <span className={styles.fieldError}>{errors.askedBy}</span>}
        </div>
        <div className={styles.field}>
          <input
            className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
            name="email"
            type="email"
            placeholder={t('services.emailPlaceholder')}
            onChange={() => clearError('email')}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>
      </div>
      <Button type="submit" variant="primary" size="sm">
        {status === 'loading' ? t('common.sending') : t('services.submitQuestion')}
      </Button>
      {status === 'error' && <p className={styles.error}>{errorMessage}</p>}
    </form>
  );
}
