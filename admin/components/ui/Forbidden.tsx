'use client';

import Link from 'next/link';
import { ShieldOff, LayoutDashboard } from 'lucide-react';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { ROLE_LABELS } from '@/lib/permissions';
import Button from './Button';
import styles from './StatusPage.module.scss';

/**
 * 403 — sahifa MAVJUD, lekin joriy rolda unga huquq yo'q.
 * 404 dan ataylab farq qiladi (bkl. app/not-found.tsx): foydalanuvchi bo'lim
 * borligini, lekin ruxsat yetishmasligini bilishi kerak — shunda u kimga
 * murojaat qilishni tushunadi.
 */
export default function Forbidden() {
  const user = useCurrentUser();

  return (
    <div className={styles.wrap}>
      <div className={styles.code}>403</div>
      <ShieldOff size={30} className={`${styles.icon} ${styles.iconDanger}`} />
      <h2 className={styles.title}>Ruxsat yo&apos;q</h2>
      <p className={styles.text}>
        Bu bo&apos;limga kirish uchun huquqingiz yetarli emas.
        {user && (
          <span className={styles.hint}>
            Joriy rol: {ROLE_LABELS[user.role] ?? user.role}
          </span>
        )}
      </p>
      <div className={styles.actions}>
        <Link href="/dashboard">
          <Button icon={LayoutDashboard}>Dashboardga qaytish</Button>
        </Link>
      </div>
    </div>
  );
}
