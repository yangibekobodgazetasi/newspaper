import { api, uploadFile } from './api';
import type { ImageSpec, MediaAsset, MediaKind } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export async function getImageSpecs(): Promise<ImageSpec[]> {
  const data = await api.get<{ items: ImageSpec[] }>('/admin/media/specs');
  return data.items;
}

export async function getMediaAssets(kind: MediaKind): Promise<MediaAsset[]> {
  const data = await api.get<{ items: MediaAsset[] }>(`/admin/media?kind=${kind}`);
  return data.items;
}

export async function uploadMediaAsset(kind: MediaKind, file: File): Promise<MediaAsset> {
  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  return uploadFile<MediaAsset>('/admin/media/upload', form);
}

export async function deleteMediaAsset(id: string): Promise<{ success: boolean }> {
  return api.delete(`/admin/media/${id}`);
}

/** Backend nisbiy `/uploads/...` manzilini to'liq URL'ga aylantiradi. */
export function getAssetUrl(asset: MediaAsset): string {
  return `${BACKEND_ORIGIN}${asset.url}`;
}

/** Har qanday nisbiy backend fayl yo'lini (masalan TeamMember.photo) to'liq URL'ga aylantiradi. */
export function resolveBackendUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  return `${BACKEND_ORIGIN}${path}`;
}
