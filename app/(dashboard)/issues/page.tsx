'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Download, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { resolveBackendUrl } from '@/lib/media';
import type { Issue, Paginated } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function IssuesListPage() {
  return (
    <RequirePermission need="issues:view">
      <IssuesListPageInner />
    </RequirePermission>
  );
}

function IssuesListPageInner() {
  const toast = useToast();
  const [items, setItems] = useState<Issue[] | null>(null);
  const [toDelete, setToDelete] = useState<Issue | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get<Paginated<Issue>>('/admin/issues?pageSize=50').then((data) => setItems(data.items));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/issues/${toDelete.id}`);
      toast.success("Son o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Sonlar arxivi"
        description="Gazetaning barcha sonlarini boshqarish"
        action={<Button icon={Plus} onClick={() => (window.location.href = '/issues/new')}>Yangi son qo&apos;shish</Button>}
      />

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          columns={[
            { header: 'Raqam', render: (i) => `№${i.number} (${i.id})` },
            { header: 'Sana', render: (i) => i.date },
            { header: 'Sahifa', render: (i) => i.pages },
            { header: 'Hajm', render: (i) => i.fileSize },
            {
              // Eski yozuvlarda `pdfUrl` hech qanday faylga ishora qilmasligi mumkin —
              // bunday sonlar aniq belgilanadi, chunki saytda yuklab olish tugmasi
              // umuman ko'rsatilmaydi va buni bilmasdan sezish qiyin.
              header: 'PDF',
              render: (i) =>
                i.pdfAvailable ? (
                  <a href={resolveBackendUrl(i.pdfUrl)} target="_blank" rel="noreferrer" title="PDF'ni ochish">
                    <Download size={15} />
                  </a>
                ) : (
                  <Badge tone="warning">
                    <AlertTriangle size={11} style={{ marginRight: 4 }} />
                    Yuklanmagan
                  </Badge>
                ),
            },
            {
              header: '',
              width: '90px',
              render: (i) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/issues/${i.id}`}><Button variant="ghost" size="sm" icon={Pencil}>{''}</Button></Link>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(i)}>{''}</Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Sonni o'chirish"
        description={toDelete ? `№${toDelete.number} (${toDelete.id}) o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
