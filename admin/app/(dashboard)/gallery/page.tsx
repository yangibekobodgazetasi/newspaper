'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem, type GalleryItem } from '@/lib/gallery';
import { useToast } from '@/components/ui/Toast';
import { resolveBackendUrl } from '@/lib/media';
import { useFormErrors } from '@/lib/useFormErrors';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormField from '@/components/ui/FormField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import ImagePicker from '@/components/media/ImagePicker';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from './page.module.scss';

const RULES = {
  caption: { required: true },
  publishedAt: { required: true },
};

export default function GalleryPage() {
  return (
    <RequirePermission need="gallery:view">
      <GalleryPageInner />
    </RequirePermission>
  );
}

function GalleryPageInner() {
  const toast = useToast();
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toEdit, setToEdit] = useState<GalleryItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { errors, validate, clearError, reset: resetErrors } = useFormErrors(RULES);
  const editForm = useFormErrors(RULES);

  const load = () => {
    getGalleryItems().then(setItems);
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
    try {
      await createGalleryItem({
        caption: String(form.get('caption')),
        publishedAt: String(form.get('publishedAt')),
        imageUrl: String(form.get('imageUrl') || '') || null,
      });
      toast.success("Rasm qo'shildi");
      setModalOpen(false);
      resetErrors();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const closeEdit = () => {
    setToEdit(null);
    setEditError(null);
    editForm.reset();
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!toEdit) return;
    setEditError(null);
    if (!editForm.validate(e.currentTarget)) return;
    setSaving(true);

    const form = new FormData(e.currentTarget);
    try {
      await updateGalleryItem(toEdit.id, {
        caption: String(form.get('caption')),
        publishedAt: String(form.get('publishedAt')),
        // Bo'sh qiymat `null` bo'lib ketadi — backend rasmni tozalaydi (`undefined` bo'lsa o'zgarmasdi).
        imageUrl: String(form.get('imageUrl') || '') || null,
      });
      toast.success('Rasm saqlandi');
      setToEdit(null);
      editForm.reset();
      load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteGalleryItem(toDelete.id);
      toast.success("Rasm o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Media galereya"
        description="Sayt bo'ylab fotolavhalar — har biri o'z rasmi bilan"
        action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Yangi fotolavha</Button>}
      />

      <Modal open={modalOpen} onClose={closeModal} title="Yangi fotolavha qo'shish" loading={creating}>
        <form onSubmit={handleCreate} noValidate>
          <FormField label="Rasm (4:3)" hint="Tanlang yoki shu yerning o'zida yangi rasm yuklang">
            <ImagePicker kind="GALLERY_IMAGE" name="imageUrl" />
          </FormField>
          <FormField label="Izoh" required error={errors.caption}>
            <Input
              name="caption"
              placeholder="Rasm haqida qisqacha izoh"
              invalid={!!errors.caption}
              onChange={() => clearError('caption')}
            />
          </FormField>
          <FormField label="Sana" required error={errors.publishedAt}>
            <Input
              name="publishedAt"
              type="date"
              invalid={!!errors.publishedAt}
              onChange={() => clearError('publishedAt')}
            />
          </FormField>
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" icon={Plus} disabled={creating}>
            {creating ? "Qo'shilmoqda..." : "Qo'shish"}
          </Button>
        </form>
      </Modal>

      {/* Tahrirlash — `key` bilan: har safar boshqa element tanlanganda forma va ImagePicker
          holati noldan quriladi (aks holda oldingi elementning rasmi ko'rinib qolardi). */}
      <Modal open={!!toEdit} onClose={closeEdit} title="Fotolavhani tahrirlash" loading={saving}>
        {toEdit && (
          <form key={toEdit.id} onSubmit={handleEdit} noValidate>
            <FormField label="Rasm (4:3)" hint="Boshqasini tanlang, yangi yuklang yoki butunlay olib tashlang">
              <ImagePicker kind="GALLERY_IMAGE" name="imageUrl" defaultValue={toEdit.imageUrl} />
            </FormField>
            <FormField label="Izoh" required error={editForm.errors.caption}>
              <Input
                name="caption"
                defaultValue={toEdit.caption}
                invalid={!!editForm.errors.caption}
                onChange={() => editForm.clearError('caption')}
              />
            </FormField>
            <FormField label="Sana" required error={editForm.errors.publishedAt}>
              <Input
                name="publishedAt"
                type="date"
                defaultValue={toEdit.publishedAt}
                invalid={!!editForm.errors.publishedAt}
                onChange={() => editForm.clearError('publishedAt')}
              />
            </FormField>
            {editError && <p className={styles.error}>{editError}</p>}
            <Button type="submit" icon={Pencil} disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </form>
        )}
      </Modal>

      <h3 className={styles.title} style={{ marginTop: 28 }}>Barcha fotolavhalar</h3>

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p>Hozircha fotolavha yo&apos;q</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveBackendUrl(item.imageUrl)} alt={item.caption} className={styles.thumb} />
              ) : (
                <div className={styles.placeholder} />
              )}
              <div className={styles.meta}>
                <p className={styles.caption}>{item.caption}</p>
                <div className={styles.metaRow}>
                  <span>{item.publishedAt}</span>
                  <div className={styles.rowActions}>
                    <button className={styles.iconBtn} onClick={() => setToEdit(item)} aria-label="Tahrirlash">
                      <Pencil size={13} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setToDelete(item)} aria-label="O'chirish">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Fotolavhani o'chirish"
        description={toDelete ? `"${toDelete.caption}" o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
