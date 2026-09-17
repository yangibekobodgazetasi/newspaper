import type { ReactNode } from 'react';
import styles from './FormField.module.scss';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
  error?: string;
  /**
   * `FormGrid` ichida butun qatorni egallasin. Katta textarea, rasm tanlagich
   * va til tablari uchun. Grid'dan tashqarida ta'sirsiz.
   */
  span?: 'full';
}

export default function FormField({ label, children, hint, required, error, span }: FormFieldProps) {
  return (
    <div className={`${styles.field} ${span === 'full' ? styles.full : ''}`}>
      <label className={styles.label}>
        {label} {required && <span className={styles.req}>*</span>}
      </label>
      {children}
      {error ? <p className={styles.error}>{error}</p> : hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
