import { api } from './api';
import type { Paginated } from '@/types';

export interface GalleryItem {
  id: string;
  cover: string;
  imageUrl?: string;
  caption: string;
  publishedAt: string;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const data = await api.get<Paginated<GalleryItem>>('/admin/gallery?pageSize=100');
  return data.items;
}

export async function createGalleryItem(payload: {
  caption: string;
  publishedAt: string;
  imageUrl?: string | null;
}): Promise<GalleryItem> {
  return api.post('/admin/gallery', payload);
}

export async function updateGalleryItem(
  id: string,
  payload: { caption?: string; publishedAt?: string; imageUrl?: string | null }
): Promise<GalleryItem> {
  return api.put(`/admin/gallery/${id}`, payload);
}

export async function deleteGalleryItem(id: string): Promise<{ success: boolean }> {
  return api.delete(`/admin/gallery/${id}`);
}
