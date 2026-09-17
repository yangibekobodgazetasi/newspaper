import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SubNav from '@/components/ui/SubNav';
import { ABOUT_PAGES } from '@/lib/about';
import styles from './layout.module.scss';

export default function AboutLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <main className={styles.main}>
      <Breadcrumbs items={[{ label: t('nav.about') }]} />
      <div className={styles.layout}>
        <SubNav items={ABOUT_PAGES.map((p) => ({ href: p.href, label: t(p.labelKey) }))} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
