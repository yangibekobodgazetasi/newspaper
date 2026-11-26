'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { NewsItem } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import NewsForm from '@/components/news/NewsForm';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';

export default function EditNewsPage() {
  return (
    <RequirePermission need="news:view">
      <EditNewsPageInner />
    </RequirePermission>
  );
}

function EditNewsPageInner() {
  const params = useParams<{ id: string }>();
  const { defaultLocale } = useActiveLanguages();
  const [item, setItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    api.get<NewsItem>(`/admin/news/${params.id}`).then(setItem);
  }, [params.id]);

  if (!item) return <Spinner />;

  const title = item.translations.find((t) => t.locale === defaultLocale)?.title ?? item.translations[0]?.title ?? '';

  return (
    <div>
      <PageHeader title="Yangilikni tahrirlash" description={title} />
      <NewsForm initial={item} variant={item.featured ? 'featured' : 'standard'} />
    </div>
  );
}
