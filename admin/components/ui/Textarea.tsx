import type { TextareaHTMLAttributes } from 'react';
import styles from './inputs.module.scss';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export default function Textarea({ invalid, className, ...props }: TextareaProps) {
  return <textarea className={`${styles.textarea} ${invalid ? styles.invalid : ''} ${className ?? ''}`} rows={5} {...props} />;
}
