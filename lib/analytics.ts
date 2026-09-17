import { api } from './api';
import type { AnalyticsRange, VisitsAnalytics } from '@/types';

export async function getVisitsAnalytics(range: AnalyticsRange): Promise<VisitsAnalytics> {
  return api.get<VisitsAnalytics>(`/admin/analytics/visits?range=${range}`);
}
