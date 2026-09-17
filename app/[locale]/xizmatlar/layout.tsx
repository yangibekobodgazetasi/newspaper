import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SubNav from '@/components/ui/SubNav';
import { SERVICE_PAGES } from '@/lib/services';
import styles from '../gazeta-haqida/layout.module.scss';

export default function ServicesLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('nav.services') }]} />
      <div className={styles.layout}>
        <SubNav items={SERVICE_PAGES.map((p) => ({ href: p.href, label: t(p.labelKey) }))} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
