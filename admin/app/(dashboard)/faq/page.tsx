'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';
import {
  getFaqItems,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  type FaqItem,
  type FaqTranslationInput,
} from '@/lib/faq';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import { useFormErrors, type FieldRule } from '@/lib/useFormErrors';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import LocaleTabs from '@/components/ui/LocaleTabs';
import FaqTranslationFields from '@/components/faq/FaqTranslationFields';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from './page.module.scss';

export default function FaqPage() {
  return (
    <RequirePermission need="faq:view">
      <FaqPageInner />
    </RequirePermission>
  );
}

function FaqPageInner() {
  const toast = useToast();
  const { languages, defaultLocale } = useActiveLanguages();
  const [items, setItems] = useState<FaqItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toEdit, setToEdit] = useState<FaqItem | null>(null);
  const [toDelete, setToDelete] = useState<FaqItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Faqat standart til majburiy — qolgan tillar bo'sh qoldirilishi mumkin
  // (frontend o'sha holatda standart tilga fallback qiladi).
  const rules: Record<string, FieldRule> = {};
  for (const lang of languages ?? []) {
    if (lang.isDefault) {
      rules[`question__${lang.code}`] = { required: true };
      rules[`answer__${lang.code}`] = { required: true };
    }
  }
  const { errors, validate, clearError, reset: resetErrors } = useFormErrors(rules);

  const load = () => {
    getFaqItems().then(setItems);
  };

  useEffect(load, []);

  /** Formadagi barcha til maydonlarini `translations[]` massiviga yig'adi. */
  const collectTranslations = (form: FormData): FaqTranslationInput[] =>
    (languages ?? [])
      .map((lang) => {
        const question = String(form.get(`question__${lang.code}`) || '').trim();
        const answer = String(form.get(`answer__${lang.code}`) || '').trim();
        // Bo'sh til yuborilmaydi — backend uni o'chiradi va sayt fallback qiladi
        if ((!question || !answer) && !lang.isDefault) return null;
        return { locale: lang.code, question, answer };
      })
      .filter((t): t is FaqTranslationInput => t !== null);

  const closeCreate = () => {
    setCreateOpen(false);
    setError(null);
    resetErrors();
  };

  const closeEdit = () => {
    setToEdit(null);
    setError(null);
    resetErrors();
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validate(e.currentTarget)) return;
    setSaving(true);

    try {
      await createFaqItem(collectTranslations(new FormData(e.currentTarget)));
      toast.success("Savol qo'shildi");
      closeCreate();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!toEdit) return;
    setError(null);
    if (!validate(e.currentTarget)) return;
    setSaving(true);

    try {
      await updateFaqItem(toEdit.id, { translations: collectTranslations(new FormData(e.currentTarget)) });
      toast.success('Savol saqlandi');
      closeEdit();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteFaqItem(toDelete.id);
      toast.success("Savol o'chirildi");
      setToDelete(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tez-tez beriladigan savollar"
        description="Saytdagi TTBS bo'limi — savol va javoblar har bir til uchun alohida"
        action={
          <Button icon={Plus} onClick={() => setCreateOpen(true)} disabled={!languages}>
            Yangi savol
          </Button>
        }
      />

      <Modal open={createOpen} onClose={closeCreate} title="Yangi savol qo'shish" loading={saving}>
        {languages && (
          <form onSubmit={handleCreate} noValidate>
            <LocaleTabs languages={languages}>
              {(locale, isDefault) => (
                <FaqTranslationFields
                  locale={locale}
                  isDefault={isDefault}
                  errors={errors}
                  onFieldChange={clearError}
                />
              )}
            </LocaleTabs>
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" icon={Plus} disabled={saving}>
              {saving ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </form>
        )}
      </Modal>

      {/* `key` — boshqa savol tanlanganda forma maydonlari noldan quriladi,
          aks holda oldingi savolning matni ko'rinib qolardi. */}
      <Modal open={!!toEdit} onClose={closeEdit} title="Savolni tahrirlash" loading={saving}>
        {languages && toEdit && (
          <form key={toEdit.id} onSubmit={handleEdit} noValidate>
            <LocaleTabs languages={languages}>
              {(locale, isDefault) => (
                <FaqTranslationFields
                  locale={locale}
                  isDefault={isDefault}
                  initial={toEdit.translations.find((t) => t.locale === locale)}
                  errors={errors}
                  onFieldChange={clearError}
                />
              )}
            </LocaleTabs>
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" icon={Save} disabled={saving}>
              {saving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
            </Button>
          </form>
        )}
      </Modal>

      {!items ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={items}
          columns={[
            {
              header: 'Savol',
              render: (f) =>
                f.translations.find((t) => t.locale === defaultLocale)?.question ??
                f.translations[0]?.question ??
                '—',
            },
            { header: 'Tillar', width: '120px', render: (f) => f.translations.map((t) => t.locale.toUpperCase()).join(', ') },
            {
              header: '',
              width: '90px',
              render: (f) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" icon={Pencil} onClick={() => { setError(null); resetErrors(); setToEdit(f); }}>{''}</Button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(f)}>{''}</Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Savolni o'chirish"
        description={
          toDelete
            ? `"${toDelete.translations.find((t) => t.locale === defaultLocale)?.question ?? toDelete.id}" o'chirilsinmi? Barcha tillardagi tarjimasi bilan birga o'chadi.`
            : ''
        }
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => { setToDelete(null); setDeleteError(null); }}
        loading={deleting}
      />
    </div>
  );
}
