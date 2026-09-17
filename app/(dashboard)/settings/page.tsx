import PageHeader from '@/components/ui/PageHeader';
import JsonContentEditor from '@/components/content/JsonContentEditor';
import RequirePermission from '@/components/layout/RequirePermission';

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
