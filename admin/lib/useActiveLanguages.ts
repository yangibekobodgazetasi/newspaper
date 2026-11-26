'use client';

import { useEffect, useState } from 'react';
import { getActiveLanguages } from './languages';
import type { Language } from '@/types';

/**
 * Faol tillarni (tartib bo'yicha) yuklaydi — News/Category/Team/StaticContent
 * formalarining til tablari shu bitta hookdan foydalanadi (DRY). Yangi til
 * admin panelda qo'shilsa, shu hook orqali barcha formalarda avtomatik
 * yangi tab paydo bo'ladi — qo'shimcha o'zgarish shart emas.
 */
export function useActiveLanguages(): { languages: Language[] | null; defaultLocale: string | undefined } {
  const [languages, setLanguages] = useState<Language[] | null>(null);

  useEffect(() => {
    getActiveLanguages().then(setLanguages);
  }, []);

  const defaultLocale = languages?.find((l) => l.isDefault)?.code ?? languages?.[0]?.code;

  return { languages, defaultLocale };
}
