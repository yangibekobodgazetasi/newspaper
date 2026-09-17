'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { resolveBackendUrl } from '@/lib/media';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { TeamMember } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function TeamListPage() {
  return (
    <RequirePermission need="team:view">
      <TeamListPageInner />
    </RequirePermission>
  );
}

function TeamListPageInner() {
  const toast = useToast();
  const { defaultLocale } = useActiveLanguages();
  const [items, setItems] = useState<TeamMember[] | null>(null);
  const [toDelete, setToDelete] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get<{ items: TeamMember[] }>('/admin/team').then((data) => setItems(data.items));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/team/${toDelete.id}`);
      toast.success("Jamoa a'zosi o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bizning jamoa"
        description="Tahririyat xodimlarini boshqarish"
        action={<Button icon={Plus} onClick={() => (window.location.href = '/team/new')}>A&apos;zo qo&apos;shish</Button>}
      />

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          columns={[
            {
              header: '',
              width: '48px',
              render: (m) =>
                m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveBackendUrl(m.photo)}
                    alt={m.name}
                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EAF4FB' }} />
                ),
            },
            { header: 'Ism', render: (m) => m.name },
            { header: 'Lavozim', render: (m) => m.translations.find((t) => t.locale === defaultLocale)?.role ?? '—' },
            {
              header: '',
              width: '90px',
              render: (m) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/team/${m.id}`}><Button variant="ghost" size="sm" icon={Pencil}>{''}</Button></Link>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(m)}>{''}</Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="A'zoni o'chirish"
        description={toDelete ? `"${toDelete.name}" o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
