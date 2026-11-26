// Amaldagi rollar: SUPER_ADMIN | BOSH_MUHARRIR | MUXBIR.
// DIZAYNER va MODERATOR eskirgan — yangi foydalanuvchiga tayinlanmaydi, lekin
// bazada qolgan yozuvlarni ko'rsata olish uchun turda saqlanadi
// (bkl. lib/permissions.ts va backend/src/types/permissions.ts).
export type AdminRole = 'SUPER_ADMIN' | 'BOSH_MUHARRIR' | 'MUXBIR' | 'DIZAYNER' | 'MODERATOR';

// Autentifikatsiya faqat username+password orqali — email bu modelda ishtirok etmaydi.
export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  role: AdminRole;
  /** Roli eskirganmi — ro'yxatda ogohlantirish ko'rsatish uchun (faqat /admin/users javobida). */
  roleDeprecated?: boolean;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export interface Language {
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  isRTL: boolean;
  order: number;
}

/** Har bir tarjima yozuvida umumiy bo'lgan meta-maydonlar — kelajakdagi AI-tarjima uchun tayyor. */
export interface TranslationMeta {
  origin: 'HUMAN' | 'AI';
  aiModel?: string;
  translatedAt?: string;
  isReviewed: boolean;
}

/** Tizim toifalari (kod ichida maxsus render uchun ishlatiladi) + admin qo'shishi mumkin bo'lgan istalgan boshqa toifa slug'i */
export type NewsCategorySlug = string;

export type CoverVariant = 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4';

export interface NewsTranslation extends TranslationMeta {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface NewsItem {
  id: string;
  categorySlug: NewsCategorySlug;
  /** Muallif nomi (saytda chiqadi) — huquq tekshiruvi uchun ishlatilmaydi */
  author: string;
  /** Yozuvni yaratgan admin id'si; eski yozuvlarda `null` bo'lishi mumkin */
  authorId: string | null;
  publishedAt: string;
  cover: CoverVariant;
  coverImage?: string;
  featured?: boolean;
  translations: NewsTranslation[];
}

export interface Issue {
  id: string;
  number: number;
  date: string;
  pages: number;
  fileSize: string;
  pdfUrl: string;
  /** PDF fayli serverda haqiqatan bormi (backend tekshiradi) */
  pdfAvailable: boolean;
  coverImage?: string;
}

/** GET /api/admin/issues/pdf-spec — backenddagi `ISSUE_PDF_SPEC` bilan bir xil shakl */
export interface PdfSpec {
  label: string;
  maxFileSizeMb: number;
  accept: string;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
}

/** POST /api/admin/issues/upload-pdf javobi */
export interface UploadedPdf {
  url: string;
  originalName: string;
  fileSize: string;
  fileSizeKb: number;
}

export interface TeamMemberTranslation extends TranslationMeta {
  locale: string;
  role: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string; // tarjima qilinmaydi
  photo: string | null;
  order?: number;
  translations: TeamMemberTranslation[];
}

export interface StaticContentRecord extends TranslationMeta {
  key: string;
  locale: string;
  data: Record<string, unknown>;
  updatedAt?: string;
}

export interface SurveyOption {
  id: string;
  label: string;
  votes: number;
}

export interface Survey {
  id: string;
  question: string;
  isActive: boolean;
  createdAt?: string;
  options: SurveyOption[];
}

export interface ForumTopic {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorEmail?: string | null;
  replyCount: number;
  createdAt: string;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string | null;
  askedBy: string;
  email?: string | null;
  status: 'pending' | 'answered';
  createdAt: string;
}

export interface Subscriber {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  locale: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DashboardData {
  counts: {
    news: number;
    issues: number;
    subscribers: number;
    pendingQuestions: number;
    forumTopics: number;
    visitsLast24h: number;
  };
  activeSurvey: Survey | null;
  recentNews: { id: string; title: string; publishedAt: string }[];
  recentMessages: {
    id: string;
    ticketId: string;
    fullName: string;
    phone: string | null;
    subject: string;
    email: string;
    message: string;
    createdAt: string;
  }[];
}

export type AnalyticsRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface VisitsAnalytics {
  range: AnalyticsRange;
  data: { label: string; count: number }[];
  last24h: number;
}

export type MediaKind =
  | 'HERO_BANNER'
  | 'NEWS_COVER'
  | 'ISSUE_COVER'
  | 'TEAM_PHOTO'
  | 'GALLERY_IMAGE'
  | 'PARTNER_LOGO'
  | 'PROMO_BANNER';

export interface ImageSpec {
  kind: MediaKind;
  label: string;
  description: string;
  aspectRatio: number;
  width1x: number;
  height1x: number;
  width2x: number;
  height2x: number;
  maxFileSizeMb: number;
  allowedFormats: string[];
}

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  url: string;
  width: number;
  height: number;
  scale: '1x' | '2x';
  fileSizeKb: number;
  originalName: string;
  uploadedBy?: string | null;
  createdAt: string;
}
