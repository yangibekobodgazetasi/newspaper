'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { createForumTopic } from '@/lib/services';
import { useFormErrors } from '@/hooks/useFormErrors';
import styles from './NewTopicForm.module.scss';

export default function NewTopicForm() {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const { errors, validate, clearError } = useFormErrors({
    title: { required: true },
    body: { required: true },
    authorName: { required: true },
    authorEmail: { required: true, email: true },
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
      await createForumTopic({
        title: String(form.get('title')),
        body: String(form.get('body')),
        authorName: String(form.get('authorName')),
        authorEmail: String(form.get('authorEmail') || '') || undefined,
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return <p className={styles.success}>{t('services.topicSubmitted')}</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.title ? styles.invalid : ''}`}
          name="title"
          type="text"
          placeholder={t('services.topicTitlePlaceholder')}
          onChange={() => clearError('title')}
        />
        {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
      </div>
      <div className={styles.field}>
        <textarea
          className={`${styles.textarea} ${errors.body ? styles.invalid : ''}`}
          name="body"
          placeholder={t('services.topicBodyPlaceholder')}
          rows={4}
          onChange={() => clearError('body')}
        />
        {errors.body && <span className={styles.fieldError}>{errors.body}</span>}
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <input
            className={`${styles.input} ${errors.authorName ? styles.invalid : ''}`}
            name="authorName"
            type="text"
            placeholder={t('services.namePlaceholder')}
            onChange={() => clearError('authorName')}
          />
          {errors.authorName && <span className={styles.fieldError}>{errors.authorName}</span>}
        </div>
        <div className={styles.field}>
          <input
            className={`${styles.input} ${errors.authorEmail ? styles.invalid : ''}`}
            name="authorEmail"
            type="email"
            placeholder={t('services.emailPlaceholder')}
            onChange={() => clearError('authorEmail')}
          />
          {errors.authorEmail && <span className={styles.fieldError}>{errors.authorEmail}</span>}
        </div>
      </div>
      <Button type="submit" variant="primary" size="sm">
        {status === 'loading' ? t('common.sending') : t('services.submitTopic')}
      </Button>
      {status === 'error' && <p className={styles.error}>{t('common.genericError')}</p>}
    </form>
  );
}
