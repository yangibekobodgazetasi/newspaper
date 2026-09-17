import type { ReactNode } from 'react';
import RequireAuth from '@/components/layout/RequireAuth';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import DashboardShell from '@/components/layout/DashboardShell';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <DashboardShell>{children}</DashboardShell>
      </SidebarProvider>
    </RequireAuth>
  );
}
