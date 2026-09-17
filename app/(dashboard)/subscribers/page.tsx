'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { Subscriber, Paginated } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function SubscribersPage() {
  return (
    <RequirePermission need="subscribers:view">
      <SubscribersPageInner />
    </RequirePermission>
  );
}

function SubscribersPageInner() {
  const toast = useToast();
  const [items, setItems] = useState<Subscriber[] | null>(null);
  const [toDelete, setToDelete] = useState<Subscriber | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get<Paginated<Subscriber>>('/admin/subscribers?pageSize=100').then((data) => setItems(data.items));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/subscribers/${toDelete.id}`);
      toast.success("Obunachi o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Obunachilar" description="Telefon raqami orqali obuna bo'lgan foydalanuvchilar ro'yxati" />

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          emptyText="Hozircha obunachi yo'q"
          columns={[
            { header: 'Ism', render: (s) => s.fullName },
            { header: 'Telefon', render: (s) => s.phone },
            { header: 'Email', render: (s) => s.email || '—' },
            { header: 'Sana', render: (s) => new Date(s.createdAt).toLocaleDateString('uz-UZ') },
            {
              header: '',
              width: '50px',
              render: (s) => <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(s)}>{''}</Button>,
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Obunachini o'chirish"
        description={toDelete ? `"${toDelete.fullName}" (${toDelete.phone}) o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
