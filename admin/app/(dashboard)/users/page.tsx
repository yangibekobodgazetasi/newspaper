'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useFormErrors } from '@/lib/useFormErrors';
import type { AdminUser } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import FormField from '@/components/ui/FormField';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import RequirePermission from '@/components/layout/RequirePermission';
import RoleSelect from '@/components/users/RoleSelect';
import { ROLE_LABELS } from '@/lib/permissions';
import styles from './page.module.scss';

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,19}$/;
const USERNAME_MESSAGE = "Kichik lotin harfi bilan boshlanishi, faqat harf/raqam/_ va 3-20 belgi bo'lishi kerak";

// Email autentifikatsiyada ishtirok etmaydi — user management formalarida ham yo'q.
const CREATE_RULES = {
  fullName: { required: true },
  username: { required: true, pattern: USERNAME_PATTERN, message: USERNAME_MESSAGE },
  password: { required: true, pattern: /^.{6,}$/, message: "Parol kamida 6 belgidan iborat bo'lishi kerak" },
  role: { required: true },
};

const EDIT_RULES = {
  fullName: { required: true },
  username: { required: true, pattern: USERNAME_PATTERN, message: USERNAME_MESSAGE },
  role: { required: true },
  // Ixtiyoriy: bo'sh qoldirilsa parol o'zgarmaydi.
  password: { pattern: /^.{6,}$/, message: "Parol kamida 6 belgidan iborat bo'lishi kerak" },
};

export default function UsersPage() {
  return (
    <RequirePermission need="users:manage">
      <UsersPageInner />
    </RequirePermission>
  );
}

function UsersPageInner() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toEdit, setToEdit] = useState<AdminUser | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const createForm = useFormErrors(CREATE_RULES);
  const editForm = useFormErrors(EDIT_RULES);

  const load = () => {
    api.get<{ items: AdminUser[] }>('/admin/users').then((data) => setUsers(data.items));
  };

  useEffect(load, []);

  const closeCreate = () => {
    setCreateOpen(false);
    setError(null);
    createForm.reset();
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!createForm.validate(e.currentTarget)) return;
    setCreating(true);

    const form = new FormData(e.currentTarget);
    try {
      await api.post('/admin/users', {
        fullName: String(form.get('fullName')),
        username: String(form.get('username')).trim().toLowerCase(),
        password: String(form.get('password')),
        role: String(form.get('role')),
      });
      toast.success("Foydalanuvchi qo'shildi");
      setCreateOpen(false);
      createForm.reset();
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
    const password = String(form.get('password') || '');
    try {
      await api.put(`/admin/users/${toEdit.id}`, {
        fullName: String(form.get('fullName')),
        username: String(form.get('username')).trim().toLowerCase(),
        role: String(form.get('role')),
        // Parol faqat to'ldirilgan bo'lsa yuboriladi — aks holda backend eskisini saqlab qoladi.
        ...(password ? { password } : {}),
      });
      toast.success('Foydalanuvchi saqlandi');
      setToEdit(null);
      editForm.reset();
      load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    await api.put(`/admin/users/${user.id}`, { isActive: !user.isActive });
    toast.success(user.isActive ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi faollashtirildi');
    load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${toDelete.id}`);
      toast.success("Foydalanuvchi o'chirildi");
      setToDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Foydalanuvchilar va rollar"
        description="Faqat Super Admin ko'ra oladi"
        action={<Button icon={Plus} onClick={() => setCreateOpen(true)}>Yangi foydalanuvchi</Button>}
      />

      <Modal open={createOpen} onClose={closeCreate} title="Yangi foydalanuvchi qo'shish" loading={creating}>
        <form onSubmit={handleCreate} noValidate>
          <FormField label="Ism Familiya" required error={createForm.errors.fullName}>
            <Input name="fullName" invalid={!!createForm.errors.fullName} onChange={() => createForm.clearError('fullName')} />
          </FormField>
          <FormField label="Username" required hint={createForm.errors.username ? undefined : 'masalan: sherzod_y'} error={createForm.errors.username}>
            <Input name="username" invalid={!!createForm.errors.username} onChange={() => createForm.clearError('username')} />
          </FormField>
          <FormField label="Vaqtinchalik parol" required error={createForm.errors.password}>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              invalid={!!createForm.errors.password}
              onChange={() => createForm.clearError('password')}
            />
          </FormField>
          <FormField label="Rol" required error={createForm.errors.role}>
            <RoleSelect name="role" invalid={!!createForm.errors.role} onChange={() => createForm.clearError('role')} />
          </FormField>
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" icon={Plus} disabled={creating}>
            {creating ? "Qo'shilmoqda..." : "Qo'shish"}
          </Button>
        </form>
      </Modal>

      <h3 className={styles.title} style={{ marginTop: 28 }}>Barcha foydalanuvchilar</h3>

      {!users ? (
        <Spinner />
      ) : (
        <DataTable
          keyField="id"
          rows={users}
          columns={[
            { header: 'Ism', render: (u) => u.fullName },
            { header: 'Username', render: (u) => <code>{u.username}</code> },
            {
              header: 'Rol',
              // Eskirgan rolli yozuv qolgan bo'lsa ko'zga tashlanadi — bunday
              // foydalanuvchi amalda eng kam huquq bilan ishlaydi, unga yangi
              // rol tayinlash kerak (bkl. backend normalizeRole).
              render: (u) => (
                <Badge tone={u.roleDeprecated ? 'warning' : undefined}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </Badge>
              ),
            },
            {
              header: 'Holat',
              render: (u) => (
                <button className={styles.toggle} onClick={() => toggleActive(u)}>
                  {u.isActive ? <Badge tone="success">Faol</Badge> : <Badge tone="danger">Bloklangan</Badge>}
                </button>
              ),
            },
            {
              header: '',
              width: '90px',
              render: (u) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setToEdit(u)}>{''}</Button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(u)}>{''}</Button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={!!toEdit} onClose={closeEdit} title={toEdit ? `Tahrirlash — ${toEdit.fullName}` : 'Tahrirlash'} loading={saving}>
        {toEdit && (
          <form onSubmit={handleEdit} noValidate>
            <FormField label="Ism Familiya" required error={editForm.errors.fullName}>
              <Input
                name="fullName"
                defaultValue={toEdit.fullName}
                invalid={!!editForm.errors.fullName}
                onChange={() => editForm.clearError('fullName')}
              />
            </FormField>
            <FormField label="Username" required error={editForm.errors.username}>
              <Input
                name="username"
                defaultValue={toEdit.username}
                invalid={!!editForm.errors.username}
                onChange={() => editForm.clearError('username')}
              />
            </FormField>
            <FormField label="Rol" required error={editForm.errors.role}>
              <RoleSelect
                name="role"
                defaultValue={toEdit.role}
                invalid={!!editForm.errors.role}
                onChange={() => editForm.clearError('role')}
              />
            </FormField>
            <FormField
              label="Yangi parol"
              hint={editForm.errors.password ? undefined : "Bo'sh qoldirilsa parol o'zgarmaydi"}
              error={editForm.errors.password}
            >
              {/* Mavjud parol hech qachon yuklanmaydi/ko'rsatilmaydi — faqat yangi parol kiritiladi. */}
              <PasswordInput
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                invalid={!!editForm.errors.password}
                onChange={() => editForm.clearError('password')}
              />
            </FormField>
            {editError && <p className={styles.error}>{editError}</p>}
            <Button type="submit" icon={Pencil} disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Foydalanuvchini o'chirish"
        description={toDelete ? `"${toDelete.fullName}" o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
