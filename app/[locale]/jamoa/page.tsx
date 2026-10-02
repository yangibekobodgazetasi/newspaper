import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import TeamCard from '@/components/cards/TeamCard';
import { getTeam } from '@/lib/team';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface TeamPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: TeamPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  return buildMetadata({
    locale,
    path: '/jamoa',
    title: t('nav.team'),
    description: t('team.lead'),
  });
}

export default async function TeamPage(props: TeamPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations();
  const team = await getTeam(locale);
  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('nav.team') }]} />
      <h1 className={styles.title}>{t('nav.team')}</h1>
      <p className={styles.lead}>{t('team.lead')}</p>
      <h2 className="sr-only">{t('a11y.teamMembers')}</h2>
      <div className={styles.grid}>
        {team.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </main>
  );
}
