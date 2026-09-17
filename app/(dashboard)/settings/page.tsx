import PageHeader from '@/components/ui/PageHeader';
import JsonContentEditor from '@/components/content/JsonContentEditor';
import RequirePermission from '@/components/layout/RequirePermission';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function SettingsPage() {
  return (
    <RequirePermission need="settings:view">
      <div>
        <PageHeader
          title="Sozlamalar"
          description="Sayt umumiy sozlamalari (til, SEO). Hozircha bu ma'lumot faqat saqlanadi — keyingi bosqichda frontendga ulanadi."
        />
        <JsonContentEditor contentKey="settings:general" label="Umumiy sozlamalar" />
      </div>
    </RequirePermission>
  );
}
