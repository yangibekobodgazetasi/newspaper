'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getVisitsAnalytics } from '@/lib/analytics';
import type { AnalyticsRange, VisitsAnalytics } from '@/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import styles from './VisitsChart.module.scss';

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 'daily', label: 'Kunlik (24 soat)' },
  { value: 'weekly', label: 'Haftalik' },
  { value: 'monthly', label: 'Oylik' },
  { value: 'yearly', label: 'Yillik' },
];

export default function VisitsChart() {
  const [range, setRange] = useState<AnalyticsRange>('weekly');
  const [data, setData] = useState<VisitsAnalytics | null>(null);

  useEffect(() => {
    setData(null);
    getVisitsAnalytics(range).then(setData);
  }, [range]);

  return (
    <Card>
      <div className={styles.head}>
        <h3 className={styles.title}>Sayt tashriflari</h3>
        <div className={styles.tabs}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              className={`${styles.tab} ${range === r.value ? styles.active : ''}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <Spinner />
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1667A0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1667A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,61,98,0.1)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#587184' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#587184' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12.5, borderRadius: 6, border: '1px solid rgba(10,61,98,0.13)' }}
                labelStyle={{ fontWeight: 700, color: '#0A3D62' }}
              />
              <Area type="monotone" dataKey="count" name="Tashriflar" stroke="#1667A0" strokeWidth={2} fill="url(#visitsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
