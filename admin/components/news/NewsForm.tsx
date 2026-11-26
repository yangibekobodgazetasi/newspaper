'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { hasPermission } from '@/lib/permissions';
import { getCategories, type NewsCategory } from '@/lib/categories';
import { getNewsAuthors, type NewsAuthorsResult } from '@/lib/newsAuthors';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import { useFormErrors, type FieldRule } from '@/lib/useFormErrors';
import { COVER_VARIANTS } from '@/lib/constants';
import type { NewsItem } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import FormField from '@/components/ui/FormField';
import FormGrid from '@/components/ui/FormGrid';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ImagePicker from '@/components/media/ImagePicker';
import LocaleTabs from '@/components/ui/LocaleTabs';
import styles from './NewsForm.module.scss';

interface NewsFormProps {
  initial?: NewsItem;
  /** 'featured' = "Bosh material" — HERO_BANNER (1600x900, sifatliroq) rasm talab qilinadi va har doim bosh sahifada chiqadi. */
  variant?: 'standard' | 'featured';
}

/** Muallif select'idagi "Boshqa" bandining maxsus qiymati — haqiqiy ism bilan chalkashmasligi uchun. */
const OTHER_AUTHOR_VALUE = '__other__';

/** Yaratish va tahrirlashda bir xil forma — DRY. `initial` berilsa PUT, aks holda POST. */
export default function NewsForm({ initial, variant = 'standard' }: NewsFormProps) {
  const router = useRouter();
  const toast = useToast();
  const user = useCurrentUser();
  const { languages, defaultLocale } = useActiveLanguages();
  const [categories, setCategories] = useState<NewsCategory[] | null>(null);
  const [authors, setAuthors] = useState<NewsAuthorsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Ketma-ket "yangi xabar yaratish"da ImagePicker/LocaleTabs eski holati qolib ketmasligi uchun —
  // har muvaffaqiyatli create'dan keyin bu qiymat oshiriladi va `key` orqali forma to'liq qayta mount qilinadi.
  const [formKey, setFormKey] = useState(0);
  const isFeatured = variant === 'featured';
  // Muxbirda `news:feature` yo'q — "bosh material" belgisini ko'rsatmaymiz.
  const canFeature = hasPermission(user?.role, 'news:feature');
  const imageKind = isFeatured ? 'HERO_BANNER' : 'NEWS_COVER';

  // Muallif jamoa ro'yxatidan tanlanadi (imlo/registr xilma-xilligining oldini
  // olish uchun), lekin xaridor talabiga ko'ra jamoadan tashqari muallif ham
  // bo'lishi mumkin — "Boshqa" tanlansa erkin matn maydoniga o'tiladi.
  const initialAuthor = initial?.author ?? '';
  const [authorMode, setAuthorMode] = useState<'team' | 'other'>('team');

  useEffect(() => {
    getCategories().then(setCategories);
    // Jamoa ro'yxatini olishda xatolik bo'lsa ham forma ochilishi kerak —
    // aks holda spinner'da muzlab qolardi. Bo'sh ro'yxat holati quyida
    // alohida ko'rsatma bilan qayta ishlanadi.
    getNewsAuthors()
      .then(setAuthors)
      .catch(() => setAuthors({ items: [], externalSuggestions: [] }));
  }, []);

  // Ro'yxat yuklangach: joriy muallif jamoada bo'lmasa, forma to'g'ridan-to'g'ri
  // "Boshqa" rejimida ochiladi (qiymat tayyor turadi) — bir martalik sintetik
  // select bandi o'rniga, endi to'liq tahrirlanadigan erkin maydon sifatida.
  useEffect(() => {
    if (!authors) return;
    const inTeam = authors.items.some((a) => a.name === initialAuthor);
    if (initialAuthor && !inTeam) setAuthorMode('other');
  }, [authors, initialAuthor]);

  const getInitialTranslation = (locale: string) => initial?.translations.find((t) => t.locale === locale);

  const rules: Record<string, FieldRule> = {
    categorySlug: { required: true },
    author: { required: true },
    publishedAt: { required: true },
    cover: { required: true },
  };
  if (languages) {
    for (const lang of languages) {
      if (lang.isDefault) {
        rules[`title__${lang.code}`] = { required: true };
        rules[`excerpt__${lang.code}`] = { required: true };
      }
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

    // Har bir til uchun forma maydonlari `title__uz`, `excerpt__ru` kabi nomlangan —
    // barcha til-panellari doim DOM'da (LocaleTabs), shuning uchun FormData'da
    // barchasi mavjud bo'ladi, faqat bo'sh (standart bo'lmagan) tillar filtrlanadi.
    const translations = languages
      .map((lang) => {
        const title = String(form.get(`title__${lang.code}`) || '').trim();
        const excerpt = String(form.get(`excerpt__${lang.code}`) || '').trim();

        if (!title && !excerpt && !lang.isDefault) return null; // ixtiyoriy til to'ldirilmagan — o'tkazib yuborish

        return {
          locale: lang.code,
          title,
          excerpt,
          body: String(form.get(`body__${lang.code}`) || '') || undefined,
          metaTitle: String(form.get(`metaTitle__${lang.code}`) || '') || undefined,
          metaDescription: String(form.get(`metaDescription__${lang.code}`) || '') || undefined,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const payload = {
      categorySlug: String(form.get('categorySlug')),
      author: String(form.get('author')),
      publishedAt: String(form.get('publishedAt')),
      cover: String(form.get('cover')),
      // Bo'sh bo'lsa `null` — `undefined` emas: JSON.stringify `undefined`ni tashlab
      // yuboradi va backend rasmni o'chirilmagan deb hisoblardi (rasmni olib tashlash ishlamasdi).
      coverImage: String(form.get('coverImage') || '') || null,
      featured: isFeatured ? true : form.get('featured') === 'on',
      translations,
    };

    try {
      if (initial) {
        await api.put(`/admin/news/${initial.id}`, payload);
      } else {
        await api.post('/admin/news', payload);
        setFormKey((k) => k + 1);
      }
      toast.success(initial ? "Yangilik saqlandi" : "Yangilik qo'shildi");
      router.push(isFeatured ? '/news/featured' : '/news');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!categories || !languages || !authors) return <Spinner />;

  // "team" rejimida joriy muallif ro'yxatda yo'q bo'lsa (masalan foydalanuvchi
  // "Boshqa" dan orqaga qaytgan bo'lsa), select "— tanlang —" bilan boshlanadi —
  // aks holda brauzer birinchi bandni sukut bo'yicha tanlab, muallif JIMGINA
  // almashib ketardi.
  const authorInTeam = authors.items.some((a) => a.name === initialAuthor);

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form} noValidate key={initial ? initial.id : `new-${formKey}`}>
        <div className={styles.columns}>
          {/* --- CHAP USTUN: matn --- */}
          <div>
            <FormField
              label="Tarjimalar"
              hint="Yulduzcha (*) — standart til, majburiy. Qolgan tillar ixtiyoriy, bo'sh qoldirilsa sayt standart tilni ko'rsatadi."
            >
              <LocaleTabs languages={languages}>
                {(locale, isDefault) => {
                  const t = getInitialTranslation(locale);
                  return (
                    <div className={styles.localeSection}>
                      <FormGrid>
                        <FormField
                          span="full"
                          label="Sarlavha"
                          required={isDefault}
                          hint={isDefault ? "URL (slug) shundan avtomatik generatsiya qilinadi" : undefined}
                          error={errors[`title__${locale}`]}
                        >
                          <Input
                            name={`title__${locale}`}
                            defaultValue={t?.title}
                            invalid={!!errors[`title__${locale}`]}
                            onChange={() => clearError(`title__${locale}`)}
                          />
                        </FormField>
                        <FormField span="full" label="Qisqacha mazmun" required={isDefault} error={errors[`excerpt__${locale}`]}>
                          <Textarea
                            name={`excerpt__${locale}`}
                            defaultValue={t?.excerpt}
                            rows={3}
                            invalid={!!errors[`excerpt__${locale}`]}
                            onChange={() => clearError(`excerpt__${locale}`)}
                          />
                        </FormField>
                        <FormField span="full" label="To'liq matn" hint="Paragraflar orasida bo'sh qator qoldiring">
                          <Textarea name={`body__${locale}`} defaultValue={t?.body} rows={16} />
                        </FormField>
                        <FormField label="SEO sarlavha (meta title)" hint="Bo'sh qoldirilsa asosiy sarlavha ishlatiladi">
                          <Input name={`metaTitle__${locale}`} defaultValue={t?.metaTitle} />
                        </FormField>
                        <FormField label="SEO tavsif (meta description)">
                          <Input name={`metaDescription__${locale}`} defaultValue={t?.metaDescription} />
                        </FormField>
                      </FormGrid>
                      {/* Kelajakda: shu yerga "✨ AI bilan tarjima qilish" tugmasi qo'shiladi
                          (standart til matnidan ushbu tilga avtomatik tarjima qiladi). */}
                    </div>
                  );
                }}
              </LocaleTabs>
            </FormField>
          </div>

          {/* --- O'NG USTUN: nashr metama'lumotlari --- */}
          <aside className={styles.side}>
            <FormField label="Toifa" required error={errors.categorySlug}>
              <Select
                name="categorySlug"
                defaultValue={initial?.categorySlug ?? categories[0]?.slug}
                invalid={!!errors.categorySlug}
                onChange={() => clearError('categorySlug')}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.translations.find((t) => t.locale === defaultLocale)?.label ?? c.slug}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Muallif odatda jamoa ro'yxatidan tanlanadi — ismlar har xil yozilib
                ketmasligi uchun. Saqlanadigan qiymat — ISM (backend `author`
                maydoni matn), shuning uchun jamoa a'zosi o'chirilsa ham eski
                yangiliklardagi muallif yo'qolmaydi. Jamoadan tashqari muallif
                (masalan tashqi muxbir) uchun "Boshqa" — erkin matn, avval
                ishlatilgan tashqi ismlar esa taklif sifatida chiqadi. */}
            <FormField
              label="Muallif"
              required
              error={errors.author}
              hint={
                authorMode === 'team' && authors.items.length === 0
                  ? "Jamoa ro'yxati bo'sh — avval \"Jamoa\" bo'limiga a'zo qo'shing yoki \"Boshqa\"ni tanlang"
                  : undefined
              }
            >
              {authorMode === 'team' ? (
                <Select
                  name="author"
                  defaultValue={initialAuthor}
                  invalid={!!errors.author}
                  onChange={(e) => {
                    clearError('author');
                    if (e.target.value === OTHER_AUTHOR_VALUE) setAuthorMode('other');
                  }}
                >
                  {!authorInTeam && <option value="">— tanlang —</option>}
                  {authors.items.map((a) => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                  <option value={OTHER_AUTHOR_VALUE}>Boshqa...</option>
                </Select>
              ) : (
                <div className={styles.otherAuthor}>
                  <Input
                    name="author"
                    list="author-suggestions"
                    defaultValue={initialAuthor}
                    placeholder="Muallif ismini kiriting"
                    invalid={!!errors.author}
                    onChange={() => clearError('author')}
                  />
                  <datalist id="author-suggestions">
                    {authors.externalSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  <button type="button" className={styles.otherAuthorBack} onClick={() => setAuthorMode('team')}>
                    ‹ Ro&apos;yxatdan tanlash
                  </button>
                </div>
              )}
            </FormField>

            <FormField label="Nashr sanasi" required error={errors.publishedAt}>
              <Input
                name="publishedAt"
                type="date"
                defaultValue={initial?.publishedAt}
                invalid={!!errors.publishedAt}
                onChange={() => clearError('publishedAt')}
              />
            </FormField>

            {/* Panel ikki ustunga bo'lingan holatda (1200px dan tor oyna) rasm
                tanlagich butun qatorni egallaydi — ichida galereya to'ri bor. */}
            <FormField
              span="full"
              label={isFeatured ? 'Bosh material rasmi (16:9)' : 'Muqova rasmi'}
              hint={
                isFeatured
                  ? "Kamida 930px kenglikda. Bosh sahifa hero karuselida shu ko'rinishda chiqadi"
                  : "Rasm tanlang yoki shu yerning o'zida yangi rasm yuklang, aks holda rasmsiz gradient bilan qoladi"
              }
            >
              <ImagePicker kind={imageKind} name="coverImage" defaultValue={initial?.coverImage} />
            </FormField>

            <FormField label="Muqova rangi (rasm tanlanmasa)" required error={errors.cover}>
              <Select
                name="cover"
                defaultValue={initial?.cover ?? 'gradient-1'}
                invalid={!!errors.cover}
                onChange={() => clearError('cover')}
              >
                {COVER_VARIANTS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </FormField>

            {/* "Bosh material" — tahririy nashr qarori, shuning uchun bu belgi faqat
                `news:feature` huquqi bo'lganlarga ko'rinadi. Muxbir uni yubormoqchi
                bo'lsa ham backend 403 qaytaradi (bkl. assertCanSetFeatured). */}
            {!isFeatured && canFeature && (
              <FormField label="Bosh sahifada ko'rsatish">
                <label className={styles.checkbox}>
                  <input type="checkbox" name="featured" defaultChecked={initial?.featured} />
                  <span>Bosh material sifatida belgilash (karuselga qo&apos;shish)</span>
                </label>
              </FormField>
            )}
          </aside>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" icon={Save} disabled={loading}>
            {loading ? 'Saqlanmoqda...' : initial ? "O'zgarishlarni saqlash" : 'Yangilikni yaratish'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
