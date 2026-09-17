'use client';

import RequireAuth from '@/components/layout/RequireAuth';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import DashboardShell from '@/components/layout/DashboardShell';
import NotFoundView from '@/components/ui/NotFoundView';

/**
 * Butun admin panel uchun 404. Mos route topilmagan manzillar `(dashboard)`
 * guruhiga TUSHMAYDI, shuning uchun bu sahifa root layout ichida render bo'ladi —
 * sidebar/topbar'ni ko'rsatish uchun o'sha guruh layout'idagi qatlamlar shu yerda
 * qo'lda takrorlanadi. Natijada 404 ham odatdagi admin ko'rinishida chiqadi.
 */
export default function AdminNotFound() {
  return (
    <RequireAuth>
      <SidebarProvider>
        <DashboardShell>
          <NotFoundView />
        </DashboardShell>
      </SidebarProvider>
    </RequireAuth>
  );
}
