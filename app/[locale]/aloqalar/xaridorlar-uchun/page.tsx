import type { Metadata } from 'next';
import { getXaridorlarUchun } from '@/lib/contact';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface SubscribersPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: SubscribersPageProps): Promise<Metadata> {
  const content = await getXaridorlarUchun(locale);
  return buildMetadata({ locale, path: '/aloqalar/xaridorlar-uchun', title: content.title, description: content.body?.[0] });
}

export default async function SubscribersPage({ params: { locale } }: SubscribersPageProps) {
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
