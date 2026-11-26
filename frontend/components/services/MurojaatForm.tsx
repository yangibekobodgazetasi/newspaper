'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { submitMurojaat } from '@/lib/contact';
import { useFormErrors } from '@/hooks/useFormErrors';
import { getVisitorHash } from '@/lib/visitor';
import styles from './MurojaatForm.module.scss';

export default function MurojaatForm() {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { errors, validate, clearError } = useFormErrors({
    fullName: { required: true },
    email: { required: true, email: true },
    subject: { required: true },
    message: { required: true },
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
      const result = await submitMurojaat({
        fullName: String(form.get('fullName')),
        phone: String(form.get('phone') || '') || undefined,
        email: String(form.get('email')),
        subject: String(form.get('subject')),
        message: String(form.get('message')),
        visitorHash: getVisitorHash() || undefined,
      });
      setTicketId(result.ticketId);
      setStatus('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('common.genericError'));
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className={styles.success}>
        <p>{t('contact.murojaatSuccess')} <strong>{ticketId}</strong></p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.fullName ? styles.invalid : ''}`}
          name="fullName"
          type="text"
          placeholder={t('contact.murojaatNamePlaceholder')}
          onChange={() => clearError('fullName')}
        />
        {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <input className={styles.input} name="phone" type="tel" placeholder={t('contact.murojaatPhonePlaceholder')} />
        </div>
        <div className={styles.field}>
          <input
            className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
            name="email"
            type="email"
            placeholder={t('contact.murojaatEmailPlaceholder')}
            onChange={() => clearError('email')}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>
      </div>
      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.subject ? styles.invalid : ''}`}
          name="subject"
          type="text"
          placeholder={t('contact.murojaatSubjectPlaceholder')}
          onChange={() => clearError('subject')}
        />
        {errors.subject && <span className={styles.fieldError}>{errors.subject}</span>}
      </div>
      <div className={styles.field}>
        <textarea
          className={`${styles.textarea} ${errors.message ? styles.invalid : ''}`}
          name="message"
          placeholder={t('contact.murojaatMessagePlaceholder')}
          rows={5}
          onChange={() => clearError('message')}
        />
        {errors.message && <span className={styles.fieldError}>{errors.message}</span>}
      </div>
      <Button type="submit" variant="primary" icon={Send} fullWidth>
        {status === 'loading' ? t('common.sending') : t('contact.murojaatSubmit')}
      </Button>
      {status === 'error' && <p className={styles.error}>{errorMessage}</p>}
    </form>
  );
}
