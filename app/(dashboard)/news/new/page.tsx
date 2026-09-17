import PageHeader from '@/components/ui/PageHeader';
import NewsForm from '@/components/news/NewsForm';
import RequirePermission from '@/components/layout/RequirePermission';

export default function NewNewsPage() {
  return (
    <RequirePermission need="news:create">
      <div>
        <PageHeader title="Yangi yangilik" description="Yangi material qo'shish" />
        <NewsForm />
      </div>
    </RequirePermission>
  );
}
