'use client';

import { useEffect, useState } from 'react';
import { api, getStoredUser, updateStoredUser } from './api';
import type { AdminUser } from '@/types';

/**
 * Joriy foydalanuvchi. Avval localStorage'dan o'qiladi (tez, birinchi render uchun),
 * so'ng serverdan `GET /admin/auth/me` bilan YANGILANADI.
 *
 * Server bilan solishtirish shart: SUPER_ADMIN kimningdir rolini pasaytirsa,
 * o'sha odamning brauzeridagi eski qiymat saqlanib qolar va sidebar unga tegishli
 * bo'lmagan bo'limlarni ko'rsatishda davom etardi. (Bu KO'RINISH muammosi —
 * har bir API chaqiruvi baribir serverda tekshiriladi.)
 *
 * useState+useEffect orqali, chunki server-render paytida localStorage mavjud emas
 * (hydration xatosining oldini oladi).
 */
export function useCurrentUser(): AdminUser | null {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser<AdminUser>());

    let cancelled = false;
    api
      .get<AdminUser>('/admin/auth/me')
      .then((fresh) => {
        if (cancelled) return;
        updateStoredUser(fresh);
        setUser(fresh);
      })
      // Xato (401 va h.k.) `api` ichida hal qilinadi — bu yerda saqlangan qiymat qoladi.
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
