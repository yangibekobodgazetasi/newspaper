import type { ReactNode } from 'react';
import styles from './FormGrid.module.scss';

interface FormGridProps {
  children: ReactNode;
  /** Ustunlar soni keng ekranda. 3 — faqat qisqa maydonlardan iborat formalar uchun. */
  columns?: 2 | 3;
  className?: string;
}

/**
 * Forma maydonlarining ustun tizimi. Ichidagi `<FormField span="full">`
 * maydonlari butun kenglikni egallaydi, qolganlari yonma-yon turadi.
 * 900px dan tor oynada har doim bitta ustunga tushadi.
 */
export default function FormGrid({ children, columns = 2, className }: FormGridProps) {
  return (
    <div className={`${styles.grid} ${columns === 3 ? styles.cols3 : ''} ${className ?? ''}`}>
      {children}
    </div>
  );
}
