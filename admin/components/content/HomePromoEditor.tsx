'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Save, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { StaticContentRecord } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import FormField from '@/components/ui/FormField';
import Spinner from '@/components/ui/Spinner';
import ImagePicker from '@/components/media/ImagePicker';
import styles from './HomePromoEditor.module.scss';

const CONTENT_KEY = 'home:promo';

interface PromoData {
  heading?: string | null;
  image?: string | null;
}

/**
 * Bosh sahifadagi "Bekobod — imkoniyatlar shahri" promo kartasi.
 *
 * Ma'lumot mavjud `StaticContentTranslation` jadvalida `home:promo` kaliti ostida
 * saqlanadi — yangi model yoki yangi admin API kerak emas.
 *
 * TIL: sarlavha tarjima qilinadi (har til uchun alohida saqlanadi), fon rasmi esa
 * tarjima qilinmaydi. Shuning uchun saqlashda rasm o'z yozuvi mavjud bo'lgan
 * boshqa tillarga ham yoziladi; yozuvi yo'q tillar standart tildan fallback oladi.
 *
 * Maydonlar bo'sh qoldirilsa frontend avvalgi standart ko'rinishni saqlaydi
 * (tarjima fayllaridagi sarlavha + gradient fon) — hech narsa buzilmaydi.
 */
export default function HomePromoEditor() {
  const toast = useToast();
  const { languages, defaultLocale } = useActiveLanguages();
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [data, setData] = useState<PromoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultLocale && !locale) setLocale(defaultLocale);
  }, [defaultLocale, locale]);

  useEffect(() => {
    if (!locale) return;
    setData(null);
    setSaved(false);
    api
      .get<StaticContentRecord>(`/admin/static-content/${CONTENT_KEY}?lang=${locale}`)
      // Yozuv umuman bo'lmasa 404 keladi — bu xato emas, shunchaki hali to'ldirilmagan.
      .then((record) => setData(record.data as PromoData))
      .catch(() => setData({}));
  }, [locale]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!locale || !languages) return;
    setError(null);
    setSaved(false);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const heading = String(form.get('heading') || '').trim() || null;
    const image = String(form.get('image') || '') || null;

    try {
      await api.put(`/admin/static-content/${CONTENT_KEY}?lang=${locale}`, { data: { heading, image } });
      toast.success('Saqlandi');

      // Rasmni o'z yozuvi bor boshqa tillarga ham ko'chiramiz (sarlavhaga tegmaymiz).
      for (const lang of languages) {
        if (lang.code === locale) continue;
        const record = await api
          .get<StaticContentRecord>(`/admin/static-content/${CONTENT_KEY}?lang=${lang.code}`)
          .catch(() => null);
        if (!record || record.locale !== lang.code) continue; // o'z yozuvi yo'q — fallback ishlaydi
        await api.put(`/admin/static-content/${CONTENT_KEY}?lang=${lang.code}`, {
          data: { ...(record.data as PromoData), image },
        });
      }

      setData({ heading, image });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (!languages || !locale || data === null) return <Spinner />;

  return (
    <Card>
      {/* `key` — til almashtirilganda forma va ImagePicker holati noldan quriladi */}
      <form key={locale} onSubmit={handleSubmit} noValidate>
        <div className={styles.head}>
          <div>
            <h3 className={styles.title}>Promo karta</h3>
            <p className={styles.hint}>
              Bosh sahifadagi &quot;Sonlar arxivi&quot; bo&apos;limi yonidagi karta. Bo&apos;sh
              qoldirilsa standart sarlavha va gradient fon ishlatiladi.
            </p>
          </div>
          <div className={styles.langs}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`${styles.langBtn} ${locale === lang.code ? styles.langActive : ''}`}
                onClick={() => setLocale(lang.code)}
              >
                {lang.code.toUpperCase()}
                {lang.isDefault && ' *'}
              </button>
            ))}
          </div>
        </div>

        <FormField label="Sarlavha" hint="Masalan: Bekobod — imkoniyatlar shahri">
          <Input name="heading" defaultValue={data.heading ?? ''} />
        </FormField>

        <FormField label="Fon rasmi" hint="Barcha tillarda bir xil ishlatiladi">
          <ImagePicker kind="PROMO_BANNER" name="image" defaultValue={data.image ?? undefined} />
        </FormField>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {saved && (
            <span className={styles.saved}>
              <Check size={14} /> Saqlandi
            </span>
          )}
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
