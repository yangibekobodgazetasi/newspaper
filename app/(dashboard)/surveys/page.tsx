'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useFormErrors } from '@/lib/useFormErrors';
import type { Survey } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormField from '@/components/ui/FormField';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from './page.module.scss';

const RULES = { question: { required: true } };

export default function SurveysPage() {
  return (
    <RequirePermission need="surveys:view">
      <SurveysPageInner />
    </RequirePermission>
  );
}

function SurveysPageInner() {
  const toast = useToast();
  const [surveys, setSurveys] = useState<Survey[] | null>(null);
  const [options, setOptions] = useState(['', '']);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { errors, validate, clearError, reset: resetErrors } = useFormErrors(RULES);

  const load = () => {
    api.get<{ items: Survey[] }>('/admin/surveys').then((data) => setSurveys(data.items));
  };

  useEffect(load, []);

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
    setOptionsError(null);
    setOptions(['', '']);
    resetErrors();
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validQuestion = validate(e.currentTarget);
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    const validOptions = cleanOptions.length >= 2;
    setOptionsError(validOptions ? null : 'Kamida 2 ta variant kiriting');
    if (!validQuestion || !validOptions) return;

    setSaving(true);
    const form = new FormData(e.currentTarget);

    try {
      await api.post('/admin/surveys', { question: String(form.get('question')), options: cleanOptions });
      toast.success("So'rov yaratildi");
      setModalOpen(false);
      setOptions(['', '']);
      resetErrors();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (id: string) => {
    await api.patch(`/admin/surveys/${id}/close`);
    toast.success("So'rov yopildi");
    load();
  };

  return (
    <div>
      <PageHeader
        title="So'rovlar"
        description="Yangi so'rov yaratish yopiladi eskisi avtomatik"
        action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Yangi so&apos;rov</Button>}
      />

      <Modal open={modalOpen} onClose={closeModal} title="Yangi so'rov yaratish" loading={saving}>
        <form onSubmit={handleCreate} noValidate>
          <FormField label="Savol" required error={errors.question}>
            <Input
              name="question"
              placeholder="Masalan: Qaysi rukn yoqadi?"
              invalid={!!errors.question}
              onChange={() => clearError('question')}
            />
          </FormField>

          <FormField label="Variantlar" required error={optionsError ?? undefined} hint={optionsError ? undefined : 'Kamida 2 ta'}>
            {options.map((opt, i) => (
              <Input
                key={i}
                value={opt}
                onChange={(e) => {
                  setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)));
                  setOptionsError(null);
                }}
                placeholder={`Variant ${i + 1}`}
                invalid={!!optionsError}
                style={{ marginBottom: 8 }}
              />
            ))}
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={() => setOptions((p) => [...p, ''])}>
              Variant qo&apos;shish
            </Button>
          </FormField>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={saving}>{saving ? 'Yaratilmoqda...' : "So'rovni chop etish"}</Button>
        </form>
      </Modal>

      <h3 className={styles.title} style={{ marginTop: 32 }}>Barcha so&apos;rovlar</h3>

      {!surveys ? (
        <Spinner />
      ) : (
        surveys.map((s) => (
          <Card key={s.id} className={styles.surveyCard}>
            <div className={styles.surveyHead}>
              <div style={{display:'flex'}}>
                <strong>{s.question}</strong>{' '}
                {s.isActive ? <Badge tone="success">Faol</Badge> : <Badge>Yopilgan</Badge>}
              </div>
              {s.isActive && (
                <Button variant="ghost" size="sm" icon={Lock} onClick={() => handleClose(s.id)}>Yopish</Button>
              )}
            </div>
            {s.options.map((o) => (
              <div key={o.id} className={styles.optionRow}>
                <span>{o.label}</span>
                <span className={styles.votes}>{o.votes} ovoz</span>
              </div>
            ))}
          </Card>
        ))
      )}
    </div>
  );
}
