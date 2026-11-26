'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import { subscribe } from '@/lib/services';
import { useFormErrors } from '@/hooks/useFormErrors';
import styles from './SubscribeForm.module.scss';

const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;

export default function SubscribeForm() {
  const t = useTranslations();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { errors, validate, clearError } = useFormErrors({
    fullName: { required: true },
    phone: { required: true, pattern: PHONE_PATTERN },
    email: { email: true },
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
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      await subscribe({
        fullName: String(form.get('fullName')),
        phone: String(form.get('phone')),
        email: String(form.get('email') || '') || undefined,
        locale: 'uz-latin',
      });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : t('services.subscribeError'));
    }
  };

  if (status === 'done') {
    return (
      <div className={styles.success}>
        <Phone size={20} />
        <p>{t('services.subscribeSuccess')}</p>
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
          placeholder={t('services.subscribeNamePlaceholder')}
          onChange={() => clearError('fullName')}
        />
        {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
      </div>
      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.phone ? styles.invalid : ''}`}
          name="phone"
          type="tel"
          placeholder={t('services.subscribePhonePlaceholder')}
          onChange={() => clearError('phone')}
        />
        {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
      </div>
      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.email ? styles.invalid : ''}`}
          name="email"
          type="email"
          placeholder={t('services.subscribeEmailPlaceholder')}
          onChange={() => clearError('email')}
        />
        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
      </div>
      <Button type="submit" variant="primary" fullWidth disabled={status === 'loading'}>
        {status === 'loading' ? t('common.sending') : t('common.subscribe')}
      </Button>
      {status === 'error' && <p className={styles.error}>{error}</p>}
    </form>
  );
}
