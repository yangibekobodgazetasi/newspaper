'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className || ''}`} {...rest}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
