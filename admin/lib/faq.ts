import { api } from './api';
import type { TranslationMeta } from '@/types';

export interface FaqTranslation extends TranslationMeta {
  locale: string;
  question: string;
  answer: string;
}

export interface FaqItem {
  id: string;
  order: number;
  translations: FaqTranslation[];
}

export interface FaqTranslationInput {
  locale: string;
  question: string;
  answer: string;
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const data = await api.get<{ items: FaqItem[] }>('/admin/faq');
  return data.items;
}

export async function createFaqItem(translations: FaqTranslationInput[]): Promise<FaqItem> {
  return api.post('/admin/faq', { translations });
}

export async function updateFaqItem(
  id: string,
  payload: { translations?: FaqTranslationInput[]; order?: number }
): Promise<FaqItem> {
  return api.put(`/admin/faq/${id}`, payload);
}

export async function deleteFaqItem(id: string): Promise<{ success: boolean }> {
  return api.delete(`/admin/faq/${id}`);
}
