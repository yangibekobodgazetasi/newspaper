'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { visibleNavItems, type NavItem } from '@/lib/permissions';
import { useSidebar } from './SidebarContext';
import styles from './Sidebar.module.scss';

function getActiveHref(pathname: string, items: NavItem[]): string | null {
  const matches = items.filter((i) => pathname === i.href || pathname.startsWith(i.href + '/'));
  if (matches.length === 0) return null;
  return matches.reduce((longest, item) => (item.href.length > longest.href.length ? item : longest)).href;
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const { collapsed, toggle } = useSidebar();

  
  const nav = user ? visibleNavItems(user.role) : [];
  const activeHref = getActiveHref(pathname, nav);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <Link href="/dashboard" className={styles.brand} aria-label="Dashboard">
        
        <img src="/images/logo-dark.png" alt="Yangi Bekobod" className={styles.mark} />
        <span className={styles.label}>Yangi Bekobod</span>
      </Link>

      <nav className={styles.nav}>
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${active ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} strokeWidth={1.8} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className={styles.toggle} onClick={toggle} aria-label={collapsed ? 'Kengaytirish' : 'Yig\'ish'}>
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        <span className={styles.label}>Yig&apos;ish</span>
      </button>
    </aside>
  );
}
