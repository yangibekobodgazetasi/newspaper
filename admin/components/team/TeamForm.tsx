'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import { useFormErrors, type FieldRule } from '@/lib/useFormErrors';
import type { TeamMember } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FormField from '@/components/ui/FormField';
import FormGrid from '@/components/ui/FormGrid';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ImagePicker from '@/components/media/ImagePicker';
import LocaleTabs from '@/components/ui/LocaleTabs';
import styles from './TeamForm.module.scss';

interface TeamFormProps {
  initial?: TeamMember;
}

export default function TeamForm({ initial }: TeamFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { languages } = useActiveLanguages();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Ketma-ket "yangi a'zo qo'shish"da ImagePicker eski holati qolib ketmasligi uchun.
  const [formKey, setFormKey] = useState(0);

  const rules: Record<string, FieldRule> = { name: { required: true } };
  if (languages) {
    for (const lang of languages) {
      if (lang.isDefault) rules[`role__${lang.code}`] = { required: true };
    }
  }
  const { errors, validate, clearError } = useFormErrors(rules);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!languages) return;
    if (!validate(e.currentTarget)) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const translations = languages
      .map((lang) => {
        const role = String(form.get(`role__${lang.code}`) || '').trim();
        if (!role && !lang.isDefault) return null;
        return {
          locale: lang.code,
          role,
          description: String(form.get(`description__${lang.code}`) || '') || undefined,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const payload = {
      name: String(form.get('name')),
      photo: String(form.get('photo') || '') || null,
      order: Number(form.get('order') || 0),
      translations,
    };

    try {
      if (initial) {
        await api.put(`/admin/team/${initial.id}`, payload);
      } else {
        await api.post('/admin/team', payload);
        setFormKey((k) => k + 1);
      }
      toast.success(initial ? "Jamoa a'zosi saqlandi" : "Jamoa a'zosi qo'shildi");
      router.push('/team');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!languages) return <Spinner />;

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form} noValidate key={initial ? initial.id : `new-${formKey}`}>
        <FormGrid>
          <FormField label="Ism Familiya" required hint="Tarjima qilinmaydi" error={errors.name}>
            <Input name="name" defaultValue={initial?.name} invalid={!!errors.name} onChange={() => clearError('name')} />
          </FormField>
          <FormField label="Tartib raqami" hint="Kichik raqam ro'yxatda yuqorida chiqadi">
            <Input name="order" type="number" defaultValue={initial?.order ?? 0} />
          </FormField>

          <FormField span="full" label="Rasm (kvadrat, 1:1)" hint="Tanlang yoki shu yerning o'zida yangi rasm yuklang">
            <ImagePicker kind="TEAM_PHOTO" name="photo" defaultValue={initial?.photo ?? ''} />
          </FormField>

          <FormField span="full" label="Lavozim / tavsif — tarjimalar" hint="Yulduzcha (*) — standart til, majburiy">
            <LocaleTabs languages={languages}>
              {(locale, isDefault) => {
                const t = initial?.translations.find((tr) => tr.locale === locale);
                return (
                  <div className={styles.localeSection}>
                    <FormGrid>
                      {/* Lavozim qisqa matn ("Bosh muharrir") — butun qatorni
                          egallamaydi, aks holda yorliq bilan qiymat orasi uzoqlashadi. */}
                      <FormField label="Lavozim" required={isDefault} error={errors[`role__${locale}`]}>
                        <Input
                          name={`role__${locale}`}
                          defaultValue={t?.role}
                          placeholder="masalan: Bosh muharrir"
                          invalid={!!errors[`role__${locale}`]}
                          onChange={() => clearError(`role__${locale}`)}
                        />
                      </FormField>
                      <FormField span="full" label="Tavsif" hint="Ixtiyoriy">
                        <Textarea name={`description__${locale}`} defaultValue={t?.description} rows={4} />
                      </FormField>
                    </FormGrid>
                    {/* Kelajakda: shu yerga "✨ AI bilan tarjima qilish" tugmasi qo'shiladi. */}
                  </div>
                );
              }}
            </LocaleTabs>
          </FormField>
        </FormGrid>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" icon={Save} disabled={loading}>
            {loading ? 'Saqlanmoqda...' : initial ? "O'zgarishlarni saqlash" : "A'zoni qo'shish"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
