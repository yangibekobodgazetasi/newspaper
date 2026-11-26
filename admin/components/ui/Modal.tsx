'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.scss';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** true bo'lganda overlay/Escape orqali yopish bloklanadi (submit jarayonida tasodifan yopib qo'yishning oldini oladi). */
  loading?: boolean;
}

/**
 * Umumiy modal — barcha admin "yangi qo'shish" formalarida qayta ishlatiladi.
 * MUHIM: `open=false` bo'lganda children butunlay unmount qilinadi (shart bo'yicha
 * render, CSS bilan yashirish emas) — shu tufayli modal har safar ochilganda ichidagi
 * forma/ImagePicker holati avtomatik tozalanadi, alohida reset logikasi kerak emas.
 */
export default function Modal({ open, onClose, title, children, loading }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKey);

    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(timer);
    };
  }, [open, onClose, loading]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={() => !loading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button type="button" className={styles.close} onClick={onClose} disabled={loading} aria-label="Yopish">
            <X size={16} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
