import PageHeader from '@/components/ui/PageHeader';
import IssueForm from '@/components/issues/IssueForm';
import RequirePermission from '@/components/layout/RequirePermission';

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
