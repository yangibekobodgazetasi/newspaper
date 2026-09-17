import PageHeader from '@/components/ui/PageHeader';
import HomePromoEditor from '@/components/content/HomePromoEditor';
import RequirePermission from '@/components/layout/RequirePermission';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
