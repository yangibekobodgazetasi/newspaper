import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FormField from '@/components/ui/FormField';
import type { FaqTranslation } from '@/lib/faq';

interface FaqTranslationFieldsProps {
  locale: string;
  isDefault: boolean;
  initial?: FaqTranslation;
  errors?: Record<string, string>;
  onFieldChange?: (name: string) => void;
}

/** Bitta til uchun savol/javob maydonlari — `LocaleTabs` render-prop ichida ishlatiladi. */
export default function FaqTranslationFields({
  locale,
  isDefault,
  initial,
  errors,
  onFieldChange,
}: FaqTranslationFieldsProps) {
  const questionName = `question__${locale}`;
  const answerName = `answer__${locale}`;

  return (
    <div>
      <FormField
        label="Savol"
        required={isDefault}
        hint={isDefault ? "Standart til uchun to'ldirilishi shart" : 'Bo\'sh qoldirilsa bu tilda ko\'rsatilmaydi'}
        error={errors?.[questionName]}
      >
        <Input
          name={questionName}
          defaultValue={initial?.question}
          placeholder="Gazetaga qanday obuna bo'lish mumkin?"
          invalid={!!errors?.[questionName]}
          onChange={() => onFieldChange?.(questionName)}
        />
      </FormField>
      <FormField label="Javob" required={isDefault} error={errors?.[answerName]}>
        <Textarea
          name={answerName}
          defaultValue={initial?.answer}
          placeholder="Qisqa va aniq javob"
          invalid={!!errors?.[answerName]}
          onChange={() => onFieldChange?.(answerName)}
        />
      </FormField>
    </div>
  );
}
