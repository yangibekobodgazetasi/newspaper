import { useTranslations } from 'next-intl';
import { Home, Newspaper } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './not-found.module.scss';

/**
 * Sayt uchun 404 sahifasi.
 *
 * `app/[locale]/layout.tsx` ichida joylashgani uchun Header va Footer avtomatik
 * o'z joyida qoladi — alohida takrorlash shart emas.
 *
 * Bu yerda `getTranslations` EMAS, `useTranslations` ishlatiladi: Next.js
 * not-found sahifasini `generateMetadata`siz, statik render qiladi va
 * `NextIntlClientProvider` (layout'da) tarjimalarni allaqachon taqdim etgan.
 */
export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className={styles.main}>
      {/* Raqam dekorativ — skrinriderlar uni o'qimasligi kerak,
          mazmun quyidagi sarlavhada. */}
      <div className={styles.code} aria-hidden="true">404</div>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.text}>{t('text')}</p>
      <div className={styles.actions}>
        <Button href="/" icon={Home}>{t('home')}</Button>
        <Button href="/yangiliklar" variant="outline" icon={Newspaper}>{t('news')}</Button>
      </div>
    </main>
  );
}
