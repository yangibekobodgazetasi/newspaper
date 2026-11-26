'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useFormErrors } from '@/lib/useFormErrors';
import type { Issue } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormField from '@/components/ui/FormField';
import FormGrid from '@/components/ui/FormGrid';
import Card from '@/components/ui/Card';
import ImagePicker from '@/components/media/ImagePicker';
import PdfPicker from './PdfPicker';
import styles from './IssueForm.module.scss';

interface IssueFormProps {
  initial?: Issue;
}

const RULES = {
  number: { required: true },
  date: { required: true },
  pages: { required: true },
  fileSize: { required: true },
  pdfUrl: { required: true },
};

/**
 * `id` (buyurtma raqami) — birlamchi kalit, tahrirlashda o'zgartirilmaydi va input
 * `disabled` bo'ladi. Disabled input FormData'ga UMUMAN TUSHMAYDI, shuning uchun uni
 * tahrirlash rejimida "majburiy" deb tekshirib bo'lmaydi — aks holda forma har safar
 * "Bu maydon to'ldirilishi shart" xatosi bilan to'xtab, saqlash mumkin bo'lmay qolardi.
 */
const CREATE_RULES = { ...RULES, id: { required: true } };

export default function IssueForm({ initial }: IssueFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { errors, validate, clearError } = useFormErrors(initial ? RULES : CREATE_RULES);
  // Hajm PDF yuklanganda avtomatik to'ldiriladi, lekin qo'lda ham tuzatish mumkin
  // (eski sonlarda fayl qayta yuklanmasdan faqat matn tahrirlanishi mumkin).
  const [fileSize, setFileSize] = useState(initial?.fileSize ?? '');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validate(e.currentTarget)) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      number: Number(form.get('number')),
      date: String(form.get('date')),
      pages: Number(form.get('pages')),
      fileSize: String(form.get('fileSize')),
      pdfUrl: String(form.get('pdfUrl')),
      // Bo'sh qiymat -> `null`: backend muqovani aynan shunda tozalaydi
      // (`undefined` yuborilsa Prisma "o'zgartirma" deb tushunardi).
      coverImage: String(form.get('coverImage') || '') || null,
    };

    try {
      if (initial) {
        // `id` ataylab yuborilmaydi — birlamchi kalit o'zgarmas
        await api.put(`/admin/issues/${initial.id}`, payload);
      } else {
        await api.post('/admin/issues', { id: String(form.get('id') || ''), ...payload });
      }
      toast.success(initial ? "Son saqlandi" : "Son qo'shildi");
      router.push('/issues');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormGrid columns={3}>
          <FormField label="Buyurtma raqami (ID)" required hint="Masalan: 8043" error={errors.id}>
            <Input
              name="id"
              defaultValue={initial?.id}
              disabled={!!initial}
              invalid={!!errors.id}
              onChange={() => clearError('id')}
            />
          </FormField>
          <FormField label="Son tartib raqami" required error={errors.number}>
            <Input
              name="number"
              type="number"
              defaultValue={initial?.number}
              invalid={!!errors.number}
              onChange={() => clearError('number')}
            />
          </FormField>
          <FormField label="Nashr sanasi" required error={errors.date}>
            <Input name="date" type="date" defaultValue={initial?.date} invalid={!!errors.date} onChange={() => clearError('date')} />
          </FormField>

          <FormField label="Sahifalar soni" required error={errors.pages}>
            <Input
              name="pages"
              type="number"
              defaultValue={initial?.pages}
              invalid={!!errors.pages}
              onChange={() => clearError('pages')}
            />
          </FormField>
          <FormField label="Fayl hajmi" required hint="PDF yuklanganda avtomatik to'ldiriladi" error={errors.fileSize}>
            <Input
              name="fileSize"
              value={fileSize}
              placeholder="4.2 MB"
              invalid={!!errors.fileSize}
              onChange={(e) => {
                setFileSize(e.target.value);
                clearError('fileSize');
              }}
            />
          </FormField>

          {/* Fayl tanlagichlar butun qatorni egallaydi — ular ichida yuklash tugmasi,
              nom va o'chirish tugmasi bir qatorda joylashadi. */}
          <FormField span="full" label="PDF fayl" required error={errors.pdfUrl}>
            <PdfPicker
              name="pdfUrl"
              defaultValue={initial?.pdfUrl}
              onUploaded={(info) => {
                setFileSize(info.fileSize);
                clearError('fileSize');
                clearError('pdfUrl');
              }}
            />
          </FormField>

          {/* Muqova PDF'dan MUSTAQIL boshqariladi: biri o'zgarsa ikkinchisiga ta'sir qilmaydi. */}
          <FormField
            span="full"
            label="Muqova rasmi (3:4)"
            hint="Sonlar arxivida ko'rsatiladigan gazeta yuzi. Ixtiyoriy — bo'lmasa gradient ko'rinadi"
          >
            <ImagePicker kind="ISSUE_COVER" name="coverImage" defaultValue={initial?.coverImage} />
          </FormField>
        </FormGrid>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" icon={Save} disabled={loading}>
            {loading ? 'Saqlanmoqda...' : initial ? "O'zgarishlarni saqlash" : 'Sonni qo\'shish'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
