'use client';

import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import JsonContentEditor from '@/components/content/JsonContentEditor';
import PartnerLogosEditor from '@/components/content/PartnerLogosEditor';
import RequirePermission from '@/components/layout/RequirePermission';

const TABS = [
  { key: 'umumiy', label: 'Umumiy ma\'lumot' },
  { key: 'maqsad-va-vazifalar', label: 'Maqsad va vazifalar' },
  { key: 'hamkorlik', label: 'Hamkorlik' },
  { key: 'korrupsiyaga-qarshi-kurashish', label: 'Korrupsiyaga qarshi kurashish' },
];

export default function AboutContentPage() {
  return (
    <RequirePermission need="content:view">
      <div>
        <PageHeader title="Biz haqimizda" description="Gazeta haqidagi 4 statik sahifani tahrirlash" />
        <Tabs tabs={TABS}>
          {(active) => (
            <>
              {/* "Hamkorlik" sahifasida logotiplar uchun alohida tahrirlagich —
                  JSON ichiga URL yozish o'rniga oddiy rasm tanlagich. */}
              {active === 'hamkorlik' && <PartnerLogosEditor />}
              <JsonContentEditor
                key={active}
                contentKey={`about:${active}`}
                label={TABS.find((t) => t.key === active)!.label}
              />
            </>
          )}
        </Tabs>
      </div>
    </RequirePermission>
  );
}
