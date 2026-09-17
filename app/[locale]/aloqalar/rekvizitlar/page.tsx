import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getRekvizitlar } from '@/lib/contact';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface RequisitesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: RequisitesPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const [t, r] = await Promise.all([getTranslations({ locale }), getRekvizitlar(locale)]);
  return buildMetadata({
    locale,
    path: '/aloqalar/rekvizitlar',
    title: t('nav.contactRequisites'),
    description: `${r.founder}. ${r.legalAddress}. ISSN ${r.issn}.`,
  });
}

export default async function RequisitesPage(props: RequisitesPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations();
  const r = await getRekvizitlar(locale);

  const rows: [string, string][] = [
    [t('contact.requisiteFounder'), r.founder],
    [t('contact.requisiteLegalAddress'), r.legalAddress],
    [t('contact.requisiteIssn'), r.issn],
    ...(r.bankAccount ? [[t('contact.requisiteAccount'), r.bankAccount] as [string, string]] : []),
    ...(r.inn ? [[t('contact.requisiteInn'), r.inn] as [string, string]] : []),
  ];

  return (
    <div>
      <h1 className={styles.title}>{t('nav.contactRequisites')}</h1>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
