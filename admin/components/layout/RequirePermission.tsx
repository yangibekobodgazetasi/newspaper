'use client';

import type { ReactNode } from 'react';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { hasPermission, type Permission } from '@/lib/permissions';
import Spinner from '@/components/ui/Spinner';
import Forbidden from '@/components/ui/Forbidden';

interface RequirePermissionProps {
  need: Permission;
  children: ReactNode;
}

/**
 * Sahifani faqat kerakli huquqqa ega foydalanuvchiga ko'rsatadi.
 *
 * Huquq yo'q bo'lsa 403 (Forbidden) ko'rsatiladi — 404 EMAS. Farqi muhim:
 * route mavjud, lekin ruxsat yo'q → 403; route umuman mavjud emas → 404
 * (bkl. app/not-found.tsx). Ularni aralashtirish foydalanuvchini chalg'itadi.
 *
 * Bu KO'RINISH darajasidagi guard. Sahifa ochilsa ham, undagi har bir API
 * chaqiruvi backendda `requirePermission` bilan qaytadan tekshiriladi.
 */
export default function RequirePermission({ need, children }: RequirePermissionProps) {
  const user = useCurrentUser();

  // Foydalanuvchi hali localStorage'dan o'qilmagan — hech narsa qaror qilmaymiz.
  if (!user) return <Spinner />;
  if (!hasPermission(user.role, need)) return <Forbidden />;

  return <>{children}</>;
}
