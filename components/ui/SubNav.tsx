'use client';

import { Link, usePathname } from '@/i18n/navigation';
import styles from './SubNav.module.scss';

interface SubNavItem {
  href: string;
  label: string;
}

interface SubNavProps {
  items: readonly SubNavItem[];
}

/**
 * Ko'p sahifali bo'limlar ("Gazeta haqida", "Aloqalar") ichida sahifalar orasida
 * almashish uchun umumiy yon-menyu/tab. layout.tsx ichida bir marta ishlatiladi — DRY.
 */
export default function SubNav({ items }: SubNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? styles.active : ''}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
