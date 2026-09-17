import type { CoverVariant } from '@/types';

export const COVER_VARIANTS: { value: CoverVariant; label: string }[] = [
  { value: 'gradient-1', label: '1 — havo rang' },
  { value: 'gradient-2', label: '2 — och ko\'k' },
  { value: 'gradient-3', label: '3 — kulrang' },
  { value: 'gradient-4', label: '4 — to\'q ko\'k' },
];

// ADMIN_ROLES bu yerdan olib tashlandi — rollar endi `lib/permissions.ts` da
// (ACTIVE_ADMIN_ROLES + ROLE_LABELS + ROLE_DESCRIPTIONS). Ilgari bu ro'yxatda
// eskirgan DIZAYNER/MODERATOR ham bor edi va ular rol tanlash oynasida ko'rinardi.
