import PageHeader from '@/components/ui/PageHeader';
import TeamForm from '@/components/team/TeamForm';
import RequirePermission from '@/components/layout/RequirePermission';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
