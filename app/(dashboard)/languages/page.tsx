'use client';

import { useEffect, useState } from 'react';
import { Star, EyeOff, Eye } from 'lucide-react';
import { getLanguages, activateLanguage, deactivateLanguage, setDefaultLanguage } from '@/lib/languages';
import type { Language } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from '../categories/page.module.scss';

export default function LanguagesPage() {
  return (
    <RequirePermission need="languages:manage">
      <LanguagesPageInner />
    </RequirePermission>
  );
}

function LanguagesPageInner() {
  const [languages, setLanguages] = useState<Language[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    getLanguages().then(setLanguages);
  };

  useEffect(load, []);

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    }
  };

  return (
    <div>
      <PageHeader
        title="Tillar"
        description="Sayt qo'llab-quvvatlaydigan tillar. Yozuvlar o'chirilmaydi — faqat faollashtirish/o'chirish orqali boshqariladi."
      />

      <h3 className={styles.title} style={{ marginTop: 28 }}>Barcha tillar</h3>
      {actionError && <p className={styles.error}>{actionError}</p>}

      {!languages ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="code"
          rows={languages}
          columns={[
            { header: 'Kod', render: (l) => <code>{l.code}</code> },
            { header: 'Nomi', render: (l) => l.name },
            { header: 'RTL', render: (l) => (l.isRTL ? 'Ha' : '—') },
            {
              header: 'Holat',
              render: (l) => (l.isActive ? <Badge tone="success">Faol</Badge> : <Badge tone="danger">Nofaol</Badge>),
            },
            {
              header: 'Standart',
              render: (l) =>
                l.isDefault ? (
                  <Badge tone="warning"><Star size={11} style={{ marginRight: 4 }} />Standart</Badge>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => runAction(() => setDefaultLanguage(l.code))}>
                    Standart qilish
                  </Button>
                ),
            },
            {
              header: '',
              width: '110px',
              render: (l) =>
                l.isActive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={EyeOff}
                    onClick={() => runAction(() => deactivateLanguage(l.code))}
                  >
                    O&apos;chirish
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" icon={Eye} onClick={() => runAction(() => activateLanguage(l.code))}>
                    Yoqish
                  </Button>
                ),
            },
          ]}
        />
      )}
    </div>
  );
}
