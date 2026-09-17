'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageOff, Upload, X } from 'lucide-react';
import { getMediaAssets, uploadMediaAsset, getAssetUrl, getImageSpecs, resolveBackendUrl } from '@/lib/media';
import { useToast } from '@/components/ui/Toast';
import type { ImageSpec, MediaAsset, MediaKind } from '@/types';
import Spinner from '@/components/ui/Spinner';
import styles from './ImagePicker.module.scss';

interface ImagePickerProps {
  kind: MediaKind;
  name: string;
  defaultValue?: string;
}

/**
 * Rasm tanlash — ham oldindan yuklangan rasmlar orasidan, ham shu yerning o'zida
 * yangi rasm yuklab qo'shish mumkin (alohida "Rasmlar" bo'limiga o'tish shart emas).
 * Tanlangan rasmning URL manzili `name` nomli yashirin input orqali forma bilan yuboriladi.
 */
export default function ImagePicker({ kind, name, defaultValue }: ImagePickerProps) {
  const toast = useToast();
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [selected, setSelected] = useState(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<ImageSpec | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = () => {
    getMediaAssets(kind).then(setAssets);
  };

  useEffect(load, [kind]);
  useEffect(() => {
    getImageSpecs().then((specs) => setSpec(specs.find((s) => s.kind === kind) ?? null));
  }, [kind]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Server baribir to'liq tekshiradi (o'lcham/format/hajm) — bu faqat aniq noto'g'ri
    // fayllar uchun tarmoqqa yuborishdan oldingi tezkor UX tekshiruvi.
    if (!file.type.startsWith('image/')) {
      setError("Faqat rasm fayllari yuklash mumkin");
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    if (spec) {
      const format = file.type.replace('image/', '');
      if (!spec.allowedFormats.includes(format)) {
        setError(`Ruxsat etilgan formatlar: ${spec.allowedFormats.join(', ')}`);
        if (fileInput.current) fileInput.current.value = '';
        return;
      }
      if (file.size > spec.maxFileSizeMb * 1024 * 1024) {
        setError(`Fayl hajmi juda katta. Maksimal: ${spec.maxFileSizeMb} MB`);
        if (fileInput.current) fileInput.current.value = '';
        return;
      }
    }

    setUploading(true);
    try {
      const asset = await uploadMediaAsset(kind, file);
      setSelected(asset.url);
      toast.success('Rasm yuklandi');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  /**
   * Tanlangan rasmni olib tashlash: preview yo'qoladi, yashirin input bo'shaydi
   * (forma bo'sh qiymat yuboradi → backend rasmni tozalaydi), fayl input reset
   * qilinadi va foydalanuvchi darhol boshqa rasm tanlashi/yuklashi mumkin.
   * MUHIM: bu serverdagi MediaAsset faylini O'CHIRMAYDI — u boshqa yozuvlarda ham
   * ishlatilayotgan bo'lishi mumkin; faqat shu yozuvning bog'lanishi uziladi.
   */
  const handleRemove = () => {
    setSelected('');
    setError(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  if (!assets) return <Spinner />;

  return (
    <div>
      <input type="hidden" name={name} value={selected} />

      {selected ? (
        <div className={styles.preview}>
          <div className={styles.previewBox} style={spec ? { aspectRatio: String(spec.aspectRatio) } : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveBackendUrl(selected)} alt="Tanlangan rasm" className={styles.previewImg} />
          </div>
          <div className={styles.previewSide}>
            <span className={styles.previewLabel}>Tanlangan rasm</span>
            <button type="button" className={styles.removeBtn} onClick={handleRemove}>
              <X size={14} /> Rasmni olib tashlash
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.noneState}>
          <ImageOff size={15} /> Rasm tanlanmagan
        </p>
      )}

      <div className={styles.uploadRow}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className={styles.fileInput}
          id={`imgpick-${kind}-${name}`}
        />
        <label htmlFor={`imgpick-${kind}-${name}`} className={styles.uploadLabel}>
          <Upload size={14} />
          {uploading ? 'Tekshirilmoqda...' : selected ? 'Boshqa rasm yuklash' : 'Yangi rasm yuklash'}
        </label>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {assets.length === 0 ? (
        <p className={styles.empty}>
          <ImageOff size={15} /> Bu tur uchun hali rasm yuklanmagan — yuqoridagi tugma orqali yuklang
        </p>
      ) : (
        /* Avval yuklangan rasmlar ro'yxati — qayta yuklamasdan tanlash uchun kerak.
           MUHIM: ro'yxat o'z blokida, cheklangan balandlikda skroll qilinadi. Aks holda
           rasm ko'p bo'lganda u modal ichida cheksiz cho'zilib, "Izoh"/"Sana"/"Saqlash"
           maydonlarini ekrandan pastga surib yuborardi. */
        <div className={styles.gallery}>
          <p className={styles.galleryLabel}>Avval yuklangan rasmlar ({assets.length})</p>
          <div className={styles.gridScroll}>
            <div className={styles.grid}>
              {assets.map((asset) => (
                <button
                  type="button"
                  key={asset.id}
                  className={`${styles.thumbBtn} ${selected === asset.url ? styles.active : ''}`}
                  onClick={() => setSelected(asset.url)}
                  title={asset.originalName}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getAssetUrl(asset)} alt={asset.originalName} className={styles.thumb} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
