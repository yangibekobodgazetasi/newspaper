import { Link } from '@/i18n/navigation';
import type { ReactNode, MouseEventHandler } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonVariant, ButtonSize } from '@/types';
import styles from './Button.module.scss';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  /**
   * `href` ilova sahifasi emas, balki statik fayl (masalan `/issues/8043.pdf`) yoki
   * tashqi manzil bo'lsa — `true`. Bunda locale prefiksi QO'SHILMAYDI va oddiy <a>
   * render bo'ladi. `http(s)://`, `mailto:`, `tel:` bilan boshlanadigan manzillar
   * avtomatik tashqi hisoblanadi.
   */
  external?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  disabled?: boolean;
}

/** Ilova routingiga tegishli bo'lmagan manzillar — locale prefiksi qo'shilmasligi kerak. */
function isAbsoluteUrl(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href);
}

/**
 * Umumiy tugma komponenti.
 * `href` berilsa havola, aks holda <button> sifatida render bo'ladi.
 *
 * MUHIM: ichki havolalar uchun `next/link` EMAS, `@/i18n/navigation`dagi next-intl
 * `Link` ishlatiladi — aks holda `href="/xizmatlar/obuna"` joriy tilni yo'qotib,
 * standart tilga (uz) olib ketardi.
 */
export default function Button({
  children,
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  type = 'button',
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  const className = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
  ].join(' ');

  const content = (
    <>
      {Icon && <Icon size={16} strokeWidth={2} />}
      <span>{children}</span>
    </>
  );

  if (href) {
    if (external || isAbsoluteUrl(href)) {
      return (
        <a href={href} className={className} aria-disabled={disabled}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={className} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
