'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { getCategory, updateCategory, type NewsCategory, type CategoryTranslationInput } from '@/lib/categories';
import { useToast } from '@/components/ui/Toast';
import { useActiveLanguages } from '@/lib/useActiveLanguages';
import { useFormErrors, type FieldRule } from '@/lib/useFormErrors';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import LocaleTabs from '@/components/ui/LocaleTabs';
import CategoryTranslationFields from '@/components/categories/CategoryTranslationFields';
import RequirePermission from '@/components/layout/RequirePermission';
import styles from '../page.module.scss';

export default function EditCategoryPage() {
  return (
    <RequirePermission need="categories:manage">
      <EditCategoryPageInner />
    </RequirePermission>
  );
}

function EditCategoryPageInner() {
  const toast = useToast();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { languages } = useActiveLanguages();
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rules: Record<string, FieldRule> = {};
  for (const lang of languages ?? []) {
    if (lang.isDefault) {
      rules[`label__${lang.code}`] = { required: true };
      rules[`description__${lang.code}`] = { required: true };
    }
  }
  const { errors, validate, clearError } = useFormErrors(rules);

  useEffect(() => {
    getCategory(params.slug).then(setCategory);
  }, [params.slug]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validate(e.currentTarget)) return;
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const translations: CategoryTranslationInput[] = (languages ?? [])
      .map((lang) => {
        const label = String(form.get(`label__${lang.code}`) || '').trim();
        const description = String(form.get(`description__${lang.code}`) || '').trim();
        if (!label && !description && !lang.isDefault) return null;
        return { locale: lang.code, label, description };
      })
      .filter((t): t is CategoryTranslationInput => t !== null);

    try {
      await updateCategory(params.slug, { translations });
      toast.success('Toifa saqlandi');
      router.push('/categories');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (!category || !languages) return <Spinner />;

  return (
    <div>
      <PageHeader title="Toifani tahrirlash" description={category.slug} />
      <Card className={styles.formCard}>
        <form onSubmit={handleSubmit} noValidate>
          <LocaleTabs languages={languages}>
            {(locale, isDefault) => (
              <CategoryTranslationFields
                locale={locale}
                isDefault={isDefault}
                initial={category.translations.find((t) => t.locale === locale)}
                errors={errors}
                onFieldChange={clearError}
              />
            )}
          </LocaleTabs>
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
