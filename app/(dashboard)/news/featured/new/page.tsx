import PageHeader from '@/components/ui/PageHeader';
import NewsForm from '@/components/news/NewsForm';
import RequirePermission from '@/components/layout/RequirePermission';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
