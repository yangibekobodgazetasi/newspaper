import { apiFetch } from './api';
import type { Issue, NewsItem } from '@/types';
import type { Paginated } from './types';

/** GET /api/issues */
export async function getSortedIssues(pageSize = 50): Promise<Issue[]> {
  const data = await apiFetch<Paginated<Issue>>(`/issues?pageSize=${pageSize}`);
  return data.items;
}

export async function getLatestIssue(): Promise<Issue> {
  const issues = await getSortedIssues(1);
  return issues[0];
}

/** GET /api/issues/:id */
export async function getIssueById(id: string): Promise<Issue | undefined> {
  try {
    return await apiFetch<Issue>(`/issues/${id}`);
  } catch {
    return undefined;
  }
}

/**
 * Shu son sanasida chop etilgan maqolalar. Backendda sana bo'yicha filtrlash
 * endpointi hali yo'q, shuning uchun hozircha bo'sh massiv qaytaradi —
 * keyingi bosqichda /api/news?date= parametri qo'shilganda ulanadi.
 */
export async function getArticlesForIssue(_issue: Issue): Promise<NewsItem[]> {
  return [];
}

export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
