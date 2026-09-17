'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { api, setSession } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useFormErrors } from '@/lib/useFormErrors';
import type { AuthResponse } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import FormField from '@/components/ui/FormField';
import styles from './page.module.scss';

// Login faqat username+password orqali — email umuman ishtirok etmaydi.
const RULES = {
  username: { required: true },
  password: { required: true },
};

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { errors, validate, clearError } = useFormErrors(RULES);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validate(e.currentTarget)) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const result = await api.post<AuthResponse>('/admin/auth/login', {
        username: String(form.get('username')).trim().toLowerCase(),
        password: String(form.get('password')),
      });
      setSession(result.token, result.user);
      toast.success(`Xush kelibsiz, ${result.user.fullName}`);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.brand}>
          {/* Login kartasi OQ fonda — shu sababli logotipning to'q varianti.
              Sidebar foni to'q ko'k, u yerda `logo-dark.png` (yorug' variant) ishlatiladi. */}
          <img src="/images/logo.png" alt="Yangi Bekobod" className={styles.mark} />
          <div>
            <h1>Yangi Bekobod</h1>
            <p>Boshqaruv paneli</p>
          </div>
        </div>

        <FormField label="Username" required error={errors.username}>
          <Input
            name="username"
            type="text"
            placeholder="admin"
            autoFocus
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            invalid={!!errors.username}
            onChange={() => clearError('username')}
          />
        </FormField>
        <FormField label="Parol" required error={errors.password}>
          <PasswordInput
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            invalid={!!errors.password}
            onChange={() => clearError('password')}
          />
        </FormField>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" icon={LogIn} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Kirilmoqda...' : 'Kirish'}
        </Button>
      </form>
    </div>
  );
}
