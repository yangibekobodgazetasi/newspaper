'use client';

import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from './SidebarContext';
import styles from '../../app/(dashboard)/layout.module.scss';

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <Sidebar />
      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <Topbar />
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}
