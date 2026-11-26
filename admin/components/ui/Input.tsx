import type { InputHTMLAttributes } from 'react';
import styles from './inputs.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export default function Input({ invalid, className, ...props }: InputProps) {
  return <input className={`${styles.input} ${invalid ? styles.invalid : ''} ${className ?? ''}`} {...props} />;
}
