import PageHeader from '@/components/ui/PageHeader';
import IssueForm from '@/components/issues/IssueForm';
import RequirePermission from '@/components/layout/RequirePermission';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function NewIssuePage() {
  return (
    <RequirePermission need="issues:manage">
      <div>
        <PageHeader title="Yangi son" description="Gazetaning yangi sonini qo'shish" />
        <IssueForm />
      </div>
    </RequirePermission>
  );
}
