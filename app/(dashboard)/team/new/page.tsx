import PageHeader from '@/components/ui/PageHeader';
import TeamForm from '@/components/team/TeamForm';
import RequirePermission from '@/components/layout/RequirePermission';

export default function NewTeamMemberPage() {
  return (
    <RequirePermission need="team:manage">
      <div>
        <PageHeader title="Yangi a'zo" description="Jamoaga yangi xodim qo'shish" />
        <TeamForm />
      </div>
    </RequirePermission>
  );
}
