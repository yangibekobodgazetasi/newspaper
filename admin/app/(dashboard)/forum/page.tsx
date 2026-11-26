'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { ForumTopic, Paginated } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function ForumModerationPage() {
  return (
    <RequirePermission need="forum:moderate">
      <ForumModerationPageInner />
    </RequirePermission>
  );
}

function ForumModerationPageInner() {
  const toast = useToast();
  const [items, setItems] = useState<ForumTopic[] | null>(null);
  const [toDelete, setToDelete] = useState<ForumTopic | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get<Paginated<ForumTopic>>('/admin/forum?pageSize=50').then((data) => setItems(data.items));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/forum/${toDelete.id}`);
      toast.success("Forum mavzusi o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Forum moderatsiyasi" description="Nomaqbul mavzularni o'chirish" />

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          emptyText="Forum mavzulari yo'q"
          columns={[
            { header: 'Mavzu', render: (t) => t.title },
            { header: 'Muallif', render: (t) => t.authorName },
            { header: 'Javoblar', render: (t) => t.replyCount },
            { header: 'Sana', render: (t) => new Date(t.createdAt).toLocaleDateString('uz-UZ') },
            {
              header: '',
              width: '60px',
              render: (t) => <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(t)}>{''}</Button>,
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Mavzuni o'chirish"
        description={toDelete ? `"${toDelete.title}" o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
