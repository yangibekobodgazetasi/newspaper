import { api } from './api';
import type { Language } from '@/types';

/** Barcha tillar (nofaollari ham) — Sozlamalar/Tillar boshqaruv sahifasi uchun. */
export async function getLanguages(): Promise<Language[]> {
  const data = await api.get<{ items: Language[] }>('/admin/languages');
  return data.items;
}

/** Faqat faol tillar, tartib bo'yicha — ko'p tilli formalarning tab ro'yxati uchun. */
export async function getActiveLanguages(): Promise<Language[]> {
  const all = await getLanguages();
  return all.filter((l) => l.isActive).sort((a, b) => a.order - b.order);
}

export async function updateLanguage(
  code: string,
  payload: { name?: string; isRTL?: boolean; order?: number }
): Promise<Language> {
  return api.put(`/admin/languages/${code}`, payload);
}

export async function activateLanguage(code: string): Promise<Language> {
  return api.patch(`/admin/languages/${code}/activate`);
}

export async function deactivateLanguage(code: string): Promise<Language> {
  return api.patch(`/admin/languages/${code}/deactivate`);
}

export async function setDefaultLanguage(code: string): Promise<Language> {
  return api.patch(`/admin/languages/${code}/set-default`);
}
