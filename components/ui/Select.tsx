import type { SelectHTMLAttributes, ReactNode } from 'react';
import styles from './inputs.module.scss';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  invalid?: boolean;
}

export default function Select({ children, invalid, className, ...rest }: SelectProps) {
  return (
    <select className={`${styles.select} ${invalid ? styles.invalid : ''} ${className ?? ''}`} {...rest}>
      {children}
    </select>
  );
}
