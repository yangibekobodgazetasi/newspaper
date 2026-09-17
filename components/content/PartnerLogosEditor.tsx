'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Save, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { StaticContentRecord } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ImagePicker from '@/components/media/ImagePicker';
import styles from './PartnerLogosEditor.module.scss';

const CONTENT_KEY = 'about:hamkorlik';

interface Partner {
  id: string;
  name: string;
  logo?: string | null;
}

/**
 * "Hamkorlik" sahifasidagi tashkilotlar logotiplarini boshqarish.
 *
 * NEGA ALOHIDA KOMPONENT: hamkorlar ro'yxati `StaticContentTranslation`dagi JSON
 * ichida yashaydi va uni faqat umumiy JSON tahrirlagichi orqali o'zgartirish mumkin
 * edi — ya'ni administrator logotip URL manzilini qo'lda yozib qo'yishi kerak bo'lardi.
 * Bu yerda mavjud `ImagePicker` ishlatiladi: yuklash, almashtirish va olib tashlash
 * boshqa hamma joydagi kabi. Yangi jadval yoki yangi API kerak emas.
 *
 * MUHIM (til): logotip — rasm, u tarjima qilinmaydi. Lekin hamkorlar ro'yxati har
 * bir til uchun alohida JSON'da saqlanadi. Shuning uchun saqlashda logotip BARCHA
 * faol tillarning nusxasiga yoziladi (hamkorlar `id` bo'yicha moslashtiriladi) —
 * aks holda /ru va /en sahifalarida logotip ko'rinmay qolardi.
 */
export default function PartnerLogosEditor() {
  const toast = useToast();
  const { languages, defaultLocale } = useActiveLanguages();
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!defaultLocale) return;
    api
      .get<StaticContentRecord>(`/admin/static-content/${CONTENT_KEY}?lang=${defaultLocale}`)
      .then((record) => setPartners(((record.data as { partners?: Partner[] }).partners ?? []) as Partner[]))
      .catch(() => setPartners([]));
  }, [defaultLocale]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!partners || !languages) return;
    setError(null);
    setSaved(false);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    // Bo'sh qiymat = "logotip olib tashlandi" -> null (ImagePicker shunday yuboradi)
    const logos = new Map<string, string | null>(
      partners.map((p) => [p.id, String(form.get(`logo-${p.id}`) || '') || null])
    );

    try {
      for (const lang of languages) {
        const record = await api.get<StaticContentRecord>(
          `/admin/static-content/${CONTENT_KEY}?lang=${lang.code}`
        );

        // Backend so'ralgan til uchun yozuv bo'lmasa standart tilnikini qaytaradi.
        // Bunday tilga yozib qo'ysak, u endi fallback qilmaydigan "o'z nusxasi"ga
        // ega bo'lib qoladi va sahifa matni tarjima qilinganda ham eskiligicha turadi.
        // Shuning uchun faqat HAQIQATAN o'z yozuvi bor tillarni yangilaymiz —
        // qolganlari standart tildan logotipni fallback orqali oladi.
        if (record.locale !== lang.code && lang.code !== defaultLocale) continue;

        const data = record.data as { partners?: Partner[] };
        if (!data.partners) continue; // bu tilda hamkorlar ro'yxati yo'q — tegmaymiz

        const updated = {
          ...data,
          partners: data.partners.map((p) => (logos.has(p.id) ? { ...p, logo: logos.get(p.id)! } : p)),
        };
        await api.put(`/admin/static-content/${CONTENT_KEY}?lang=${lang.code}`, { data: updated });
      }

      setPartners(partners.map((p) => ({ ...p, logo: logos.get(p.id) ?? null })));
      setSaved(true);
      toast.success('Hamkor logotiplari saqlandi');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (!languages || !partners) return <Spinner />;

  if (partners.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>
          Hamkorlar ro&apos;yxati bo&apos;sh. Avval quyidagi JSON tahrirlagichida
          <code> partners</code> ro&apos;yxatiga tashkilot qo&apos;shing.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className={styles.head}>
          <h3 className={styles.title}>Hamkor logotiplari</h3>
          <p className={styles.hint}>
            Logotip yuklanmagan hamkor saytda avvalgidek standart ikonka bilan ko&apos;rsatiladi.
            Logotiplar barcha tillarda bir xil.
          </p>
        </div>

        <div className={styles.list}>
          {partners.map((p) => (
            <div key={p.id} className={styles.row}>
              <div className={styles.name}>{p.name}</div>
              <ImagePicker kind="PARTNER_LOGO" name={`logo-${p.id}`} defaultValue={p.logo ?? undefined} />
            </div>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {saved && (
            <span className={styles.saved}>
              <Check size={14} /> Saqlandi
            </span>
          )}
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Logotiplarni saqlash'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
