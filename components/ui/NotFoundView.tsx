'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileQuestion, LayoutDashboard } from 'lucide-react';
import Button from './Button';
import styles from './StatusPage.module.scss';

/**
 * 404 — bunday route umuman mavjud emas (adres xato yozilgan yoki bo'lim o'chirilgan).
 * Huquq yetishmasligi bilan ARALASHTIRILMAYDI — u holda 403 ko'rsatiladi
 * (bkl. components/ui/Forbidden.tsx).
 */
export default function NotFoundView() {
  const pathname = usePathname();

  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <FileQuestion size={30} className={styles.icon} />
      <h2 className={styles.title}>Sahifa topilmadi</h2>
      <p className={styles.text}>
        Bunday bo&apos;lim mavjud emas. Manzil noto&apos;g&apos;ri yozilgan bo&apos;lishi mumkin.
        {pathname && <span className={styles.hint}>{pathname}</span>}
      </p>
      <div className={styles.actions}>
        <Link href="/dashboard">
          <Button icon={LayoutDashboard}>Dashboardga qaytish</Button>
        </Link>
      </div>
    </div>
  );
}
