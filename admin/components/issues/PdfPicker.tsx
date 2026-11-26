'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, FileX2, Upload, X, ExternalLink } from 'lucide-react';
import { getPdfSpec, uploadIssuePdf } from '@/lib/issues';
import { useToast } from '@/components/ui/Toast';
import { resolveBackendUrl } from '@/lib/media';
import type { PdfSpec, UploadedPdf } from '@/types';
import Spinner from '@/components/ui/Spinner';
import styles from './PdfPicker.module.scss';

interface PdfPickerProps {
  name: string;
  defaultValue?: string;
  /** Fayl yuklangach chaqiriladi — forma hajm maydonini avtomatik to'ldirishi uchun. */
  onUploaded?: (info: UploadedPdf) => void;
}

/**
 * Gazeta soni PDF'ini yuklash.
 *
 * NEGA MATN MAYDONI EMAS: avval bu joyda oddiy `pdfUrl` input turardi va unga
 * serverdagi ichki yo'l ("/issues/8043.pdf") qo'lda yozilardi — ya'ni fayl umuman
 * yuklanmasdi va ichki fayl tuzilishi administratorga ochiq ko'rinardi.
 *
 * Tanlangan fayl haqida ATAYLAB faqat asl nomi va hajmi ko'rsatiladi; serverdagi
 * saqlash yo'li interfeysda hech qayerda chiqmaydi (ochish havolasi `href` ichida).
 *
 * Tekshiruv ikki bosqichli: bu yerda (tarmoqqa yubormasdan oldin) va backendda.
 * Ikkalasi ham `GET /admin/issues/pdf-spec` dagi bir xil chegaralardan foydalanadi.
 */
export default function PdfPicker({ name, defaultValue, onUploaded }: PdfPickerProps) {
  const toast = useToast();
  const [spec, setSpec] = useState<PdfSpec | null>(null);
  const [url, setUrl] = useState(defaultValue ?? '');
  const [label, setLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPdfSpec().then(setSpec).catch(() => setSpec(null));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reset = () => {
      if (fileInput.current) fileInput.current.value = '';
    };

    if (spec) {
      // 1) Kengaytma — `accept` atributini foydalanuvchi chetlab o'tishi mumkin
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!spec.allowedExtensions.includes(ext) || !spec.allowedMimeTypes.includes(file.type)) {
        setError('Faqat PDF fayl yuklash mumkin');
        reset();
        return;
      }
      // 2) Hajm — katta faylni umuman yubormaymiz (bekorga trafik sarflanmasin)
      if (file.size > spec.maxFileSizeMb * 1024 * 1024) {
        const sizeMb = (file.size / 1024 / 1024).toFixed(1);
        setError(`Fayl hajmi juda katta (${sizeMb} MB). Maksimal: ${spec.maxFileSizeMb} MB`);
        reset();
        return;
      }
    }

    setUploading(true);
    try {
      const result = await uploadIssuePdf(file);
      setUrl(result.url);
      setLabel(`${result.originalName} · ${result.fileSize}`);
      toast.success('PDF yuklandi');
      onUploaded?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
      reset();
    }
  };

  /** Bog'lanishni uzadi. Serverdagi faylga tegmaydi — boshqa son ham unga ishora qilishi mumkin. */
  const handleRemove = () => {
    setUrl('');
    setLabel(null);
    setError(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  if (!spec) return <Spinner />;

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={styles.selected}>
          <FileText size={18} className={styles.fileIcon} />
          <div className={styles.info}>
            <span className={styles.fileName}>{label ?? 'PDF fayl yuklangan'}</span>
            <a href={resolveBackendUrl(url)} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
              <ExternalLink size={12} /> Ochish
            </a>
          </div>
          <button type="button" className={styles.removeBtn} onClick={handleRemove}>
            <X size={14} /> Olib tashlash
          </button>
        </div>
      ) : (
        <p className={styles.noneState}>
          <FileX2 size={15} /> PDF fayl tanlanmagan
        </p>
      )}

      <div className={styles.uploadRow}>
        <input
          ref={fileInput}
          type="file"
          accept={spec.accept}
          onChange={handleUpload}
          disabled={uploading}
          className={styles.fileInput}
          id={`pdfpick-${name}`}
        />
        <label htmlFor={`pdfpick-${name}`} className={styles.uploadLabel}>
          <Upload size={14} />
          {uploading ? 'Yuklanmoqda...' : url ? 'Boshqa PDF yuklash' : 'PDF yuklash'}
        </label>
        <span className={styles.limit}>Faqat .pdf · maksimal {spec.maxFileSizeMb} MB</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
