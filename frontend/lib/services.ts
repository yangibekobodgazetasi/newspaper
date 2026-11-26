import { apiFetch, apiPost } from './api';
import { formatLocalizedDate } from './date';
import type { Survey, ForumTopic, QuestionAnswer, FaqItem } from '@/types';
import type { Paginated } from './types';

// `labelKey` — to'liq namespace'li translation kaliti; SubNav asosiy navigatsiya bilan bir xil label'larni ishlatadi — DRY.
// "ttbs" bu yerda qisqa "TTBS" ko'rinishini saqlaydi (nav.servicesFaq to'liq iborasidan farqli —
// bu joyning original dizaynidagi mavjud matn farqi, o'zgartirilmadi).
export const SERVICE_PAGES = [
  { slug: 'sorov', href: '/xizmatlar/sorov', labelKey: 'nav.servicesSurvey' },
  { slug: 'forum', href: '/xizmatlar/forum', labelKey: 'nav.servicesForum' },
  { slug: 'savol-javob', href: '/xizmatlar/savol-javob', labelKey: 'nav.servicesQa' },
  { slug: 'ttbs', href: '/xizmatlar/ttbs', labelKey: 'services.faqShort' },
  { slug: 'obuna', href: '/xizmatlar/obuna', labelKey: 'nav.servicesSubscribe' },
] as const;

/** GET /api/services/sorov */
export async function getSurvey(): Promise<Survey> {
  return apiFetch<Survey>('/services/sorov', { revalidate: 0 });
}

/** POST /api/services/sorov/:id/vote */
export async function voteSurvey(surveyId: string, optionId: string): Promise<{ success: boolean }> {
  return apiPost(`/services/sorov/${surveyId}/vote`, { optionId });
}

/** GET /api/services/forum */
export async function getForumTopics(pageSize = 20): Promise<ForumTopic[]> {
  const data = await apiFetch<Paginated<ForumTopic>>(`/services/forum?pageSize=${pageSize}`, { revalidate: 60 });
  return data.items;
}

/** POST /api/services/forum */
export async function createForumTopic(payload: {
  title: string;
  body: string;
  authorName: string;
  authorEmail?: string;
}): Promise<{ id: string; success: boolean }> {
  return apiPost('/services/forum', payload);
}

/** GET /api/services/savol-javob */
export async function getQuestions(pageSize = 20): Promise<QuestionAnswer[]> {
  const data = await apiFetch<Paginated<QuestionAnswer>>(`/services/savol-javob?pageSize=${pageSize}`, { revalidate: 60 });
  return data.items;
}

/** POST /api/services/savol-javob */
export async function askQuestion(payload: {
  question: string;
  askedBy: string;
  email?: string;
  visitorHash?: string;
}): Promise<{ id: string; status: string; success: boolean }> {
  return apiPost('/services/savol-javob', payload);
}

/** GET /api/services/ttbs?lang= — savol/javob tanlangan tilda qaytadi */
export async function getFaq(locale?: string): Promise<FaqItem[]> {
  const data = await apiFetch<{ items: FaqItem[] }>('/services/ttbs', { locale });
  return data.items;
}

/** POST /api/services/obuna — ism-familiya va telefon raqami talab qilinadi (email ixtiyoriy) */
export async function subscribe(payload: {
  fullName: string;
  phone: string;
  email?: string;
  locale: string;
}): Promise<{ success: boolean; message: string }> {
  return apiPost('/services/obuna', payload);
}

export function formatRelativeDate(iso: string, locale?: string): string {
  return formatLocalizedDate(iso, locale);
}
