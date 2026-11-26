'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { clearSession } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { ROLE_LABELS } from '@/lib/permissions';
import type { AdminRole } from '@/types';
import styles from './Topbar.module.scss';

export default function Topbar() {
  const router = useRouter();
  const user = useCurrentUser();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <header className={styles.topbar}>
      <div />
      <div className={styles.right}>
        {user && (
          <div className={styles.user}>
            <span className={styles.name}>{user.fullName}</span>
            <span className={styles.role}>{ROLE_LABELS[user.role as AdminRole] ?? user.role}</span>
          </div>
        )}
        <button className={styles.logout} onClick={handleLogout} aria-label="Chiqish">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
