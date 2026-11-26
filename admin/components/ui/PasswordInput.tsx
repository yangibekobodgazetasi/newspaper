'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './PasswordInput.module.scss';
import inputStyles from './inputs.module.scss';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

/**
 * Parol maydoni — o'ng chekkasida ko'z (eye) tugmasi orqali parolni ko'rsatish/yashirish.
 * Holat faqat shu komponent ichida (parol qiymati hech qayerga saqlanmaydi).
 */
export default function PasswordInput({ invalid, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrap}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${inputStyles.input} ${invalid ? inputStyles.invalid : ''} ${styles.input} ${className ?? ''}`}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Parolni yashirish' : "Parolni ko'rsatish"}
        title={visible ? 'Parolni yashirish' : "Parolni ko'rsatish"}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
