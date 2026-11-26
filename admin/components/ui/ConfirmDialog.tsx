'use client';

import Button from './Button';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  /** Server o'chirishni rad etsa — sabab shu yerda, dialogni yopmasdan ko'rsatiladi. */
  error?: string | null;
}

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading, error }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.desc}>{description}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {error ? 'Yopish' : 'Bekor qilish'}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading || !!error}>
            {loading ? 'O\'chirilmoqda...' : "O'chirish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
