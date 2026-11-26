'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { NewsItem, Paginated } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function FeaturedNewsPage() {
  return (
    <RequirePermission need="news:feature">
      <FeaturedNewsPageInner />
    </RequirePermission>
  );
}

function FeaturedNewsPageInner() {
  const toast = useToast();
  const { defaultLocale } = useActiveLanguages();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [toDelete, setToDelete] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const newsTitle = (n: NewsItem) => n.translations.find((t) => t.locale === defaultLocale)?.title ?? '(tarjima yo\'q)';

  const load = () => {
    api.get<Paginated<NewsItem>>('/admin/news?pageSize=100').then((data) => {
      setItems(data.items.filter((n) => n.featured));
    });
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/news/${toDelete.id}`);
      toast.success("Yangilik o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bosh materiallar"
        description="Bosh sahifadagi hero karuselida chiqadigan asosiy yangiliklar — sifatli, kattaroq (1600×900) rasm bilan"
        action={<Button icon={Plus} onClick={() => (window.location.href = '/news/featured/new')}>Bosh material qo&apos;shish</Button>}
      />

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          emptyText="Hozircha bosh material belgilanmagan"
          columns={[
            { header: '', width: '28px', render: () => <Star size={15} fill="#0EA5D8" color="#0EA5D8" /> },
            { header: 'Sarlavha', render: (n) => newsTitle(n) },
            { header: 'Rasm', render: (n) => (n.coverImage ? 'Yuklangan ✓' : "Yo'q — gradient") },
            { header: 'Sana', render: (n) => n.publishedAt },
            {
              header: '',
              width: '90px',
              render: (n) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/news/${n.id}`}><Button variant="ghost" size="sm" icon={Pencil}>{''}</Button></Link>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(n)}>{''}</Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Bosh materialni o'chirish"
        description={toDelete ? `"${newsTitle(toDelete)}" o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
