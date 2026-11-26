import type { ReactNode } from 'react';
import RequireAuth from '@/components/layout/RequireAuth';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import DashboardShell from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <DashboardShell>{children}</DashboardShell>
      </SidebarProvider>
    </RequireAuth>
  );
}
