'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { TeamMember } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import TeamForm from '@/components/team/TeamForm';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function EditTeamMemberPage() {
  return (
    <RequirePermission need="team:manage">
      <EditTeamMemberPageInner />
    </RequirePermission>
  );
}

function EditTeamMemberPageInner() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<TeamMember | null | undefined>(undefined);

  useEffect(() => {
    api.get<{ items: TeamMember[] }>('/admin/team').then((data) => {
      setItem(data.items.find((m) => m.id === params.id) ?? null);
    });
  }, [params.id]);

  if (item === undefined) return <Spinner />;
  if (item === null) return <p>Topilmadi</p>;

  return (
    <div>
      <PageHeader title="A'zoni tahrirlash" description={item.name} />
      <TeamForm initial={item} />
    </div>
  );
}
