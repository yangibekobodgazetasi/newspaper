import PageHeader from '@/components/ui/PageHeader';
import NewsForm from '@/components/news/NewsForm';
import RequirePermission from '@/components/layout/RequirePermission';

export default function NewFeaturedNewsPage() {
  return (
    <RequirePermission need="news:feature">
      <div>
        <PageHeader
          title="Yangi bosh material"
          description="Bosh sahifa hero karuselida chiqadigan asosiy yangilik — yuqori sifatli rasm talab qilinadi"
        />
        <NewsForm variant="featured" />
      </div>
    </RequirePermission>
  );
}
