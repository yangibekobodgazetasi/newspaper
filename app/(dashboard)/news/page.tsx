'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { getCategories, type NewsCategory } from '@/lib/categories';
import { resolveBackendUrl } from '@/lib/media';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { NewsItem, Paginated } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function NewsListPage() {
  return (
    <RequirePermission need="news:view">
      <NewsListPageInner />
    </RequirePermission>
  );
}

function NewsListPageInner() {
  const toast = useToast();
  const { defaultLocale } = useActiveLanguages();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [category, setCategory] = useState('');
  const [toDelete, setToDelete] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    const query = category ? `?categorySlug=${category}&pageSize=50` : '?pageSize=50';
    api.get<Paginated<NewsItem>>(`/admin/news${query}`).then((data) => setItems(data.items));
  };

  useEffect(load, [category]);
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

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

  const categoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.translations.find((t) => t.locale === defaultLocale)?.label ?? slug;

  const newsTitle = (n: NewsItem) => n.translations.find((t) => t.locale === defaultLocale)?.title ?? '(tarjima yo\'q)';

  return (
    <div>
      <PageHeader
        title="Yangiliklar"
        description="Barcha yangiliklarni boshqarish"
        action={<Button icon={Plus} onClick={() => (window.location.href = '/news/new')}>Yangi qo&apos;shish</Button>}
      />

      <div style={{ marginBottom: 20, maxWidth: 280 }}>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Barcha toifalar</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{categoryLabel(c.slug)}</option>
          ))}
        </Select>
      </div>

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          emptyText="Bu toifada yangilik yo'q"
          columns={[
            {
              header: '',
              width: '52px',
              render: (n) =>
                n.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveBackendUrl(n.coverImage)}
                    alt={newsTitle(n)}
                    style={{ width: 40, height: 30, borderRadius: 4, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: 40, height: 30, borderRadius: 4, background: '#EAF4FB' }} />
                ),
            },
            { header: 'Sarlavha', render: (n) => newsTitle(n) },
            { header: 'Toifa', render: (n) => <Badge>{categoryLabel(n.categorySlug)}</Badge> },
            { header: 'Tillar', render: (n) => n.translations.map((t) => t.locale.toUpperCase()).join(', ') },
            { header: 'Sana', render: (n) => n.publishedAt },
            { header: 'Muallif', render: (n) => n.author },
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
        title="Yangilikni o'chirish"
        description={toDelete ? `"${newsTitle(toDelete)}" o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
