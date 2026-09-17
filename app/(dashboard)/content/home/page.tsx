import PageHeader from '@/components/ui/PageHeader';
import HomePromoEditor from '@/components/content/HomePromoEditor';
import RequirePermission from '@/components/layout/RequirePermission';

export default function HomeContentPage() {
  return (
    <RequirePermission need="content:view">
      <div>
        <PageHeader
          title="Bosh sahifa"
          description="Bosh sahifadagi promo kartasini tahrirlash (sarlavha va fon rasmi)"
        />
        <HomePromoEditor />
      </div>
    </RequirePermission>
  );
}
