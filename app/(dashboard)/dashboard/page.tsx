'use client';

import { useEffect, useState } from 'react';
import { Newspaper, BookImage, Mail, HelpCircle, MessageSquareText, Users, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardData } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import VisitsChart from '@/components/dashboard/VisitsChart';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from './page.module.scss';

type ContactMessageRow = DashboardData['recentMessages'][number];

const STAT_ICONS = {
  visitsLast24h: Users,
  news: Newspaper,
  issues: BookImage,
  subscribers: Mail,
  pendingQuestions: HelpCircle,
  forumTopics: MessageSquareText,
};

const STAT_LABELS: Record<keyof DashboardData['counts'], string> = {
  visitsLast24h: 'Tashriflar (24 soat)',
  news: 'Yangiliklar',
  issues: 'Sonlar',
  subscribers: 'Obunachilar',
  pendingQuestions: 'Kutilayotgan savollar',
  forumTopics: 'Forum mavzulari',
};

const STAT_ORDER: (keyof DashboardData['counts'])[] = [
  'visitsLast24h', 'news', 'issues', 'subscribers', 'pendingQuestions', 'forumTopics',
];

export default function DashboardPage() {
  return (
    <RequirePermission need="dashboard:view">
      <DashboardPageInner />
    </RequirePermission>
  );
}

function DashboardPageInner() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRow | null>(null);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <Spinner />;

  return (
    <div>
      <PageHeader title="Dashboard" description="Saytning umumiy holati bir qarashda." />

      <div className={styles.stats}>
        {STAT_ORDER.map((key) => {
          const Icon = STAT_ICONS[key];
          return (
            <Card key={key} className={styles.statCard}>
              <Icon size={20} className={styles.statIcon} />
              <div>
                <div className={styles.statValue}>{data.counts[key]}</div>
                <div className={styles.statLabel}>{STAT_LABELS[key]}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className={styles.chartSection}>
        <VisitsChart />
      </div>

      <div className={styles.grid}>
        <Card>
          <h3 className={styles.sectionTitle}>So&apos;nggi yangiliklar</h3>
          {data.recentNews.length === 0 && <p className={styles.empty}>Hozircha yangilik yo&apos;q</p>}
          {data.recentNews.map((n) => (
            <div key={n.id} className={styles.row}>
              <span>{n.title}</span>
              <span className={styles.rowMeta}>{n.publishedAt}</span>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className={styles.sectionTitle}>So&apos;nggi murojaatlar</h3>
          {data.recentMessages.length === 0 && <p className={styles.empty}>Hozircha murojaat yo&apos;q</p>}
          {data.recentMessages.map((m) => (
            <div key={m.id} className={styles.row}>
              <span>{m.subject} — {m.fullName}</span>
              <div className={styles.rowActions}>
                <span className={styles.rowMeta}>{m.email}</span>
                <Button variant="ghost" size="sm" icon={Eye} onClick={() => setSelectedMessage(m)}>Batafsil</Button>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Modal
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage ? `Murojaat — ${selectedMessage.ticketId}` : 'Murojaat'}
      >
        {selectedMessage && (
          <div className={styles.messageDetail}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Ism familiya</span>
              <span>{selectedMessage.fullName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span>{selectedMessage.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Telefon</span>
              <span>{selectedMessage.phone || '—'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Sana</span>
              <span>{new Date(selectedMessage.createdAt).toLocaleString('uz-UZ')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mavzu</span>
              <span>{selectedMessage.subject}</span>
            </div>
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Xabar matni</span>
              <p className={styles.detailMessage}>{selectedMessage.message}</p>
            </div>
          </div>
        )}
      </Modal>

      {data.activeSurvey && (
        <Card className={styles.surveyCard}>
          <h3 className={styles.sectionTitle}>Faol so&apos;rov: {data.activeSurvey.question}</h3>
          {data.activeSurvey.options.map((o) => (
            <div key={o.id} className={styles.row}>
              <span>{o.label}</span>
              <span className={styles.rowMeta}>{o.votes} ovoz</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
