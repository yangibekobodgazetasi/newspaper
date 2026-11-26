'use client';

import { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { QuestionAnswer, Paginated } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from './page.module.scss';

export default function QuestionsPage() {
  return (
    <RequirePermission need="questions:moderate">
      <QuestionsPageInner />
    </RequirePermission>
  );
}

function QuestionsPageInner() {
  const toast = useToast();
  const [items, setItems] = useState<QuestionAnswer[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<QuestionAnswer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get<Paginated<QuestionAnswer>>('/admin/questions?pageSize=50').then((data) => setItems(data.items));
  };

  useEffect(load, []);

  const handleAnswer = async (id: string) => {
    const answer = drafts[id]?.trim();
    if (!answer) return;
    setSavingId(id);
    try {
      await api.put(`/admin/questions/${id}/answer`, { answer });
      toast.success('Javob saqlandi');
      load();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await api.delete(`/admin/questions/${toDelete.id}`);
      toast.success("Savol o'chirildi");
      setToDelete(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setDeleting(false);
    }
  };

  if (!items) return <Spinner />;

  return (
    <div>
      <PageHeader title="Savol-javob" description="Kelgan savollarga javob berish" />

      {items.length === 0 && <p>Hozircha savol yo&apos;q</p>}

      {items.map((q) => (
        <Card key={q.id} className={styles.card}>
          <div className={styles.head}>
            <strong>{q.question}</strong>
            <div className={styles.headActions}>
              {q.status === 'answered' ? <Badge tone="success">Javob berilgan</Badge> : <Badge tone="warning">Kutilmoqda</Badge>}
              <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(q)}>{''}</Button>
            </div>
          </div>
          <p className={styles.meta}>{q.askedBy} · {new Date(q.createdAt).toLocaleDateString('uz-UZ')}</p>

          {q.answer && <p className={styles.answer}>{q.answer}</p>}

          {q.status === 'pending' && (
            <div className={styles.answerBox}>
              <Textarea
                rows={2}
                placeholder="Javobingizni yozing..."
                value={drafts[q.id] ?? ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
              />
              <Button size="sm" icon={Send} onClick={() => handleAnswer(q.id)} disabled={savingId === q.id}>
                {savingId === q.id ? 'Yuborilmoqda...' : 'Javob berish'}
              </Button>
            </div>
          )}
        </Card>
      ))}

      <ConfirmDialog
        open={!!toDelete}
        title="Savolni o'chirish"
        description={deleteError ?? (toDelete ? `"${toDelete.question}" o'chirilsinmi? Bu amalni orqaga qaytarib bo'lmaydi.` : '')}
        onConfirm={handleDelete}
        onCancel={() => { setToDelete(null); setDeleteError(null); }}
        loading={deleting}
      />
    </div>
  );
}
