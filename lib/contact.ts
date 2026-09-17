import { apiFetch, apiPost } from './api';
import type { ContactManzil, Requisites, ReceptionSlot } from '@/types';

interface XaridorlarContent {
  title: string;
  body: string[];
}

// `labelKey` — to'liq namespace'li translation kaliti; SubNav asosiy navigatsiya bilan bir xil label'larni ishlatadi — DRY.
export const CONTACT_PAGES = [
  { slug: 'manzil', href: '/aloqalar/manzil', labelKey: 'nav.contactAddress' },
  { slug: 'rekvizitlar', href: '/aloqalar/rekvizitlar', labelKey: 'nav.contactRequisites' },
  { slug: 'qabul-jadvali', href: '/aloqalar/qabul-jadvali', labelKey: 'nav.contactSchedule' },
  { slug: 'xaridorlar-uchun', href: '/aloqalar/xaridorlar-uchun', labelKey: 'nav.contactBuyers' },
] as const;

export async function getManzil(locale?: string): Promise<ContactManzil> {
  return apiFetch<ContactManzil>('/contact/manzil', { locale });
}

export async function getRekvizitlar(locale?: string): Promise<Requisites> {
  return apiFetch<Requisites>('/contact/rekvizitlar', { locale });
}

export async function getQabulJadvali(locale?: string): Promise<ReceptionSlot[]> {
  const data = await apiFetch<{ schedule: ReceptionSlot[] }>('/contact/qabul-jadvali', { locale });
  return data.schedule;
}

export async function getXaridorlarUchun(locale?: string): Promise<XaridorlarContent> {
  return apiFetch<XaridorlarContent>('/contact/xaridorlar-uchun', { locale });
}

/** POST /api/contact/murojaat */
export async function submitMurojaat(payload: {
  fullName: string;
  phone?: string;
  email: string;
  subject: string;
  message: string;
  visitorHash?: string;
}): Promise<{ success: boolean; ticketId: string }> {
  return apiPost('/contact/murojaat', payload);
}
