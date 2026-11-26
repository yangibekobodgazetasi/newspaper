'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getVisitorHash } from '@/lib/visitor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Har bir sahifa ochilganda backendga tashrif haqida signal yuboradi
 * (admin panel Dashboard'idagi tashrif statistikasi/grafik shu yerdan to'yinadi).
 * Xatolik bo'lsa jim o'tkazib yuboriladi — foydalanuvchi tajribasiga ta'sir qilmaydi.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API_BASE_URL}/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, visitorHash: getVisitorHash() }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
