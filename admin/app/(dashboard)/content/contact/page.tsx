'use client';

import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import JsonContentEditor from '@/components/content/JsonContentEditor';
import RequirePermission from '@/components/layout/RequirePermission';

const TABS = [
  { key: 'manzil', label: 'Bizning manzil' },
  { key: 'rekvizitlar', label: 'Bizning rekvizitlar' },
  { key: 'qabul-jadvali', label: 'Qabul qilish tartibi va jadvali' },
  { key: 'xaridorlar-uchun', label: 'Xaridorlar uchun' },
];

export default function ContactContentPage() {
  return (
    <RequirePermission need="content:view">
      <div>
        <PageHeader title="Aloqalar" description="Aloqa bo'limining 4 statik sahifasini tahrirlash" />
        <Tabs tabs={TABS}>
          {(active) => (
            <JsonContentEditor
              key={active}
              contentKey={`contact:${active}`}
              label={TABS.find((t) => t.key === active)!.label}
            />
          )}
        </Tabs>
      </div>
    </RequirePermission>
  );
}
