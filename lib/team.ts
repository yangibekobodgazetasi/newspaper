import { apiFetch } from './api';
import type { TeamMember } from '@/types';

/** GET /api/team?lang= */
export async function getTeam(locale?: string): Promise<TeamMember[]> {
  const data = await apiFetch<{ items: TeamMember[] }>('/team', { locale });
  return data.items;
}
