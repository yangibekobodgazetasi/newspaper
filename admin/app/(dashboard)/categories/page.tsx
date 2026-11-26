'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Lock, Pencil } from 'lucide-react';
import { getCategories, createCategory, deleteCategory, type NewsCategory, type CategoryTranslationInput } from '@/lib/categories';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import { useFormErrors, type FieldRule } from '@/lib/useFormErrors';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import LocaleTabs from '@/components/ui/LocaleTabs';
import CategoryTranslationFields from '@/components/categories/CategoryTranslationFields';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from './page.module.scss';

export default function CategoriesPage() {
  return (
    <RequirePermission need="categories:manage">
      <CategoriesPageInner />
    </RequirePermission>
  );
}

function CategoriesPageInner() {
  const toast = useToast();
  const { languages, defaultLocale } = useActiveLanguages();
  const [categories, setCategories] = useState<NewsCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<NewsCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rules: Record<string, FieldRule> = {};
  for (const lang of languages ?? []) {
    if (lang.isDefault) {
      rules[`label__${lang.code}`] = { required: true };
      rules[`description__${lang.code}`] = { required: true };
    }
  }
  const { errors, validate, clearError, reset: resetErrors } = useFormErrors(rules);

  const load = () => {
    getCategories().then(setCategories);
  };

  useEffect(load, []);

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
    resetErrors();
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validate(e.currentTarget)) return;
    setCreating(true);

    const form = new FormData(e.currentTarget);
    const translations: CategoryTranslationInput[] = (languages ?? [])
      .map((lang) => {
        const label = String(form.get(`label__${lang.code}`) || '').trim();
        const description = String(form.get(`description__${lang.code}`) || '').trim();
        if (!label && !description && !lang.isDefault) return null;
        return { locale: lang.code, label, description };
      })
      .filter((t): t is CategoryTranslationInput => t !== null);

    try {
      await createCategory(translations);
      toast.success("Toifa qo'shildi");
      setModalOpen(false);
      resetErrors();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteCategory(toDelete.slug);
      toast.success("Toifa o'chirildi");
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
        title="Toifalar"
        description="Yangiliklar toifalari — tizim toifalarini (sayt tuzilishiga bog'liq) o'chirib bo'lmaydi, lekin yangilarini qo'shishingiz mumkin"
        action={
          <Button icon={Plus} onClick={() => setModalOpen(true)} disabled={!languages}>
            Yangi toifa
          </Button>
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title="Yangi toifa qo'shish" loading={creating}>
        {languages && (
          <form onSubmit={handleCreate} noValidate>
            <LocaleTabs languages={languages}>
              {(locale, isDefault) => (
                <CategoryTranslationFields locale={locale} isDefault={isDefault} errors={errors} onFieldChange={clearError} />
              )}
            </LocaleTabs>
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" icon={Plus} disabled={creating}>
              {creating ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </form>
        )}
      </Modal>

      <h3 className={styles.title} style={{ marginTop: 28 }}>Barcha toifalar</h3>

      {!categories ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="slug"
          rows={categories}
          columns={[
            { header: 'Nomi', render: (c) => c.translations.find((t) => t.locale === defaultLocale)?.label ?? c.slug },
            { header: 'Slug', render: (c) => <code>{c.slug}</code> },
            { header: 'Tillar', render: (c) => c.translations.map((t) => t.locale.toUpperCase()).join(', ') },
            {
              header: 'Turi',
              render: (c) =>
                c.isSystem ? (
                  <Badge tone="warning"><Lock size={11} style={{ marginRight: 4 }} />Tizim</Badge>
                ) : (
                  <Badge tone="success">Qo'shimcha</Badge>
                ),
            },
            {
              header: '',
              width: '90px',
              render: (c) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/categories/${c.slug}`}><Button variant="ghost" size="sm" icon={Pencil}>{''}</Button></Link>
                  {!c.isSystem && (
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(c)}>{''}</Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Toifani o'chirish"
        description={deleteError ?? (toDelete ? `"${toDelete.slug}" o'chirilsinmi?` : '')}
        onConfirm={handleDelete}
        onCancel={() => { setToDelete(null); setDeleteError(null); }}
        loading={deleting}
      />
    </div>
  );
}
