'use client';

import { useState, type ReactNode } from 'react';
import styles from './Tabs.module.scss';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  children: (activeKey: string) => ReactNode;
  defaultKey?: string;
}

export default function Tabs({ tabs, children, defaultKey }: TabsProps) {
  const [active, setActive] = useState(defaultKey ?? tabs[0].key);

  return (
    <div>
      <div className={styles.list}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${active === tab.key ? styles.active : ''}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.panel}>{children(active)}</div>
    </div>
  );
}
