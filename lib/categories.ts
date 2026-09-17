import { api } from './api';
import type { TranslationMeta } from '@/types';

export interface CategoryTranslation extends TranslationMeta {
  locale: string;
  label: string;
  description: string;
}

export interface NewsCategory {
  slug: string;
  isSystem: boolean;
  order: number;
  translations: CategoryTranslation[];
}

export async function getCategories(): Promise<NewsCategory[]> {
  const data = await api.get<{ items: NewsCategory[] }>('/admin/categories');
  return data.items;
}

export async function getCategory(slug: string): Promise<NewsCategory> {
  return api.get(`/admin/categories/${slug}`);
}

export interface CategoryTranslationInput {
  locale: string;
  label: string;
  description: string;
}

export async function createCategory(translations: CategoryTranslationInput[]): Promise<NewsCategory> {
  return api.post('/admin/categories', { translations });
}

export async function updateCategory(
  slug: string,
  payload: { translations?: CategoryTranslationInput[]; order?: number }
): Promise<NewsCategory> {
  return api.put(`/admin/categories/${slug}`, payload);
}

export async function deleteCategory(slug: string): Promise<{ success: boolean }> {
  return api.delete(`/admin/categories/${slug}`);
}
