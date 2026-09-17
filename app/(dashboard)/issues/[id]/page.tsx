'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Issue } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import IssueForm from '@/components/issues/IssueForm';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function EditIssuePage() {
  return (
    <RequirePermission need="issues:manage">
      <EditIssuePageInner />
    </RequirePermission>
  );
}

function EditIssuePageInner() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<Issue | null>(null);

  useEffect(() => {
    api.get<Issue>(`/admin/issues/${params.id}`).then(setItem).catch(() => setItem(null));
  }, [params.id]);

  if (!item) return <Spinner />;

  return (
    <div>
      <PageHeader title="Sonni tahrirlash" description={`№${item.number} (${item.id})`} />
      <IssueForm initial={item} />
    </div>
  );
}
