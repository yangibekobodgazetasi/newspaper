import type { Metadata } from 'next';
import { getXaridorlarUchun } from '@/lib/contact';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface SubscribersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: SubscribersPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const content = await getXaridorlarUchun(locale);
  return buildMetadata({ locale, path: '/aloqalar/xaridorlar-uchun', title: content.title, description: content.body?.[0] });
}

export default async function SubscribersPage(props: SubscribersPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const content = await getXaridorlarUchun(locale);

  return (
    <div>
      <h1 className={styles.title}>{content.title}</h1>
      <div className={styles.body}>
        {content.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
