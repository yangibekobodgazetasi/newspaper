import Input from '@/components/ui/Input';
import FormField from '@/components/ui/FormField';
import type { CategoryTranslation } from '@/lib/categories';

interface CategoryTranslationFieldsProps {
  locale: string;
  isDefault: boolean;
  initial?: CategoryTranslation;
  errors?: Record<string, string>;
  onFieldChange?: (name: string) => void;
}

/** Bitta til uchun toifa nomi/tavsifi maydonlari — `LocaleTabs` render-prop ichida ishlatiladi. */
export default function CategoryTranslationFields({ locale, isDefault, initial, errors, onFieldChange }: CategoryTranslationFieldsProps) {
  const labelName = `label__${locale}`;
  const descName = `description__${locale}`;

  return (
    <div>
      <FormField
        label="Nomi"
        required={isDefault}
        hint={isDefault ? "URL slug shundan avtomatik yasaladi" : undefined}
        error={errors?.[labelName]}
      >
        <Input
          name={labelName}
          defaultValue={initial?.label}
          placeholder="masalan: Sport yangiliklari"
          invalid={!!errors?.[labelName]}
          onChange={() => onFieldChange?.(labelName)}
        />
      </FormField>
      <FormField label="Tavsif" required={isDefault} error={errors?.[descName]}>
        <Input
          name={descName}
          defaultValue={initial?.description}
          placeholder="Qisqacha tavsif"
          invalid={!!errors?.[descName]}
          onChange={() => onFieldChange?.(descName)}
        />
      </FormField>
      {/* Kelajakda: shu yerga "✨ AI bilan tarjima qilish" tugmasi qo'shiladi. */}
    </div>
  );
}
