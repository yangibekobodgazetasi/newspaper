'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

/** Token bo'lmasa /login sahifasiga yo'naltiradi. Client-side himoya (demo darajasida). */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
