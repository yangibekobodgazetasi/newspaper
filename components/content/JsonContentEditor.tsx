'use client';

import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import type { StaticContentRecord } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import styles from './JsonContentEditor.module.scss';

interface JsonContentEditorProps {
  contentKey: string;
  label: string;
}

/**
 * "Biz haqimizda" va "Aloqalar" sahifalari tarkibi (title/intro/body/goals/...)
 * sahifadan sahifaga farq qiladi, shuning uchun har biriga alohida forma yasash
 * o'rniga JSON ko'rinishida umumiy tahrirlagich ishlatiladi — tezkor va moslashuvchan.
 *
 * Til tanlagichi: News/Category/Team'dan farqli, bu yerda har til alohida
 * so'rov bilan yuklanadi/saqlanadi (`?lang=`) — backend shunday loyihalangan,
 * chunki JSON blob strukturasi til bo'yicha farq qilmaydi, faqat qiymatlari farq qiladi.
 */
export default function JsonContentEditor({ contentKey, label }: JsonContentEditorProps) {
  const toast = useToast();
  const { languages, defaultLocale } = useActiveLanguages();
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tillar yuklangach, standart tilni tanlab qo'yamiz (faqat bir marta)
  useEffect(() => {
    if (defaultLocale && !locale) setLocale(defaultLocale);
  }, [defaultLocale, locale]);

  useEffect(() => {
    if (!locale) return;
    setRaw(null);
    setSaved(false);
    api
      .get<StaticContentRecord>(`/admin/static-content/${contentKey}?lang=${locale}`)
      .then((record) => setRaw(JSON.stringify(record.data, null, 2)))
      .catch(() => setRaw('{}'));
  }, [contentKey, locale]);

  const handleSave = async () => {
    if (raw === null || !locale) return;
    setError(null);
    setSaved(false);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setError("JSON formati noto'g'ri — qavslar va vergullarni tekshiring");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/admin/static-content/${contentKey}?lang=${locale}`, { data: parsed });
      toast.success('Saqlandi');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (!languages || !locale || raw === null) return <Spinner />;

  return (
    <Card>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>{label}</h3>
          <p className={styles.hint}>
            Kontent JSON ko&apos;rinishida — maydonlarni saqlagan holda qiymatlarni tahrirlang.
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

      <textarea
        className={styles.editor}
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setSaved(false); }}
        spellCheck={false}
        rows={16}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        {saved && <span className={styles.saved}><Check size={14} /> Saqlandi</span>}
        <Button icon={Save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </Card>
  );
}
