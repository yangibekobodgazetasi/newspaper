import type { News, NewsTranslation, Issue, MediaItem, TeamMember, TeamMemberTranslation, NewsCategory, NewsCategoryTranslation, FaqItem } from '@prisma/client';

import { issuePdfExists } from './issueFiles';

/** Sana obyektini "YYYY-MM-DD" shakliga o'giradi — frontend shu formatni kutadi. */
function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * MUHIM: quyidagi public serializerlar to'liq Prisma modelini emas, balki FAQAT O'ZI
 * O'QIYDIGAN maydonlarni talab qiladi (`Pick<...>`). Sabab: public route'lar `select`/`include`
 * bilan qisqartirilgan qatorlar bilan ishlaydi va o'z minimal interfeyslarini e'lon qiladi
 * (masalan `NewsRow`) — ularda `createdAt`/`updatedAt`/`order` kabi kerak bo'lmagan maydonlar yo'q.
 * Maydon tiplari baribir Prisma modelidan olinadi, ya'ni schema o'zgarsa bu yer ham tekshiriladi.
 */
type NewsFields = Pick<News, 'id' | 'categorySlug' | 'author' | 'publishedAt' | 'cover' | 'coverImage' | 'featured'>;
type NewsTranslationFields = Pick<NewsTranslation, 'slug' | 'title' | 'excerpt' | 'body'>;
type TeamMemberFields = Pick<TeamMember, 'id' | 'name' | 'photo'>;
type TeamMemberTranslationFields = Pick<TeamMemberTranslation, 'role' | 'description'>;
type NewsCategoryFields = Pick<NewsCategory, 'slug' | 'isSystem'>;
type NewsCategoryTranslationFields = Pick<NewsCategoryTranslation, 'label' | 'description'>;

/**
 * News + tanlangan tildagi tarjima + toifa nomini eski (bir tilli) API shakliga birlashtiradi.
 * Natija frontend uchun avvalgidek: { id, slug, rubric, rubricSlug, title, excerpt, ... } —
 * kontrakt o'zgarmagani uchun frontend'da qo'shimcha o'zgarish talab qilinmaydi.
 */
export function serializeNews(news: NewsFields, translation: NewsTranslationFields, categoryLabel: string) {
  return {
    id: news.id,
    slug: translation.slug,
    rubric: categoryLabel,
    rubricSlug: news.categorySlug,
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body ?? undefined,
    author: news.author,
    publishedAt: toDateOnly(news.publishedAt),
    cover: news.cover,
    coverImage: news.coverImage ?? undefined,
    featured: news.featured,
  };
}

export function serializeIssue(issue: Issue) {
  return {
    id: issue.id,
    number: issue.number,
    date: toDateOnly(issue.date),
    pages: issue.pages,
    fileSize: issue.fileSize,
    pdfUrl: issue.pdfUrl,
    // PDF fayli haqiqatan mavjudmi. Eski yozuvlarda `pdfUrl` hech qanday faylga
    // ishora qilmasligi mumkin (bkl. utils/issueFiles.ts) — bunda sayt yuklab olish
    // tugmasini ko'rsatmaydi, admin panel esa ogohlantirish beradi.
    pdfAvailable: issuePdfExists(issue.pdfUrl),
    coverImage: issue.coverImage ?? undefined,
  };
}

export function serializeMediaItem(item: MediaItem) {
  return {
    id: item.id,
    cover: item.cover,
    imageUrl: item.imageUrl ?? undefined,
    caption: item.caption,
    publishedAt: toDateOnly(item.publishedAt),
  };
}

/** TeamMember + tanlangan tildagi lavozim tarjimasini birlashtiradi — kontrakt avvalgidek. */
export function serializeTeamMember(member: TeamMemberFields, translation: TeamMemberTranslationFields) {
  return {
    id: member.id,
    name: member.name,
    role: translation.role,
    description: translation.description ?? undefined,
    photo: member.photo ?? null,
  };
}

/** NewsCategory + tanlangan tildagi nom/tavsifni birlashtiradi — kontrakt avvalgidek: { slug, label, description, isSystem }. */
export function serializeCategory(category: NewsCategoryFields, translation: NewsCategoryTranslationFields) {
  return {
    slug: category.slug,
    label: translation.label,
    description: translation.description,
    isSystem: category.isSystem,
  };
}

// ============================================
// Admin serializerlari — bitta til emas, BARCHA tarjimalarni qaytaradi
// (ko'p-tilli tahrirlash formasi/tablarini to'ldirish uchun).
// ============================================

interface TranslationMetaRow {
  origin: string;
  aiModel: string | null;
  translatedAt: Date | null;
  isReviewed: boolean;
}

function serializeTranslationMeta(t: TranslationMetaRow) {
  return {
    origin: t.origin,
    aiModel: t.aiModel ?? undefined,
    translatedAt: t.translatedAt ? t.translatedAt.toISOString() : undefined,
    isReviewed: t.isReviewed,
  };
}

interface NewsTranslationRow extends TranslationMetaRow {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
}

export function serializeNewsAdmin(news: News & { translations: NewsTranslationRow[] }) {
  return {
    id: news.id,
    categorySlug: news.categorySlug,
    author: news.author,
    // Yozuv egasi — admin panelda "tahrirlash/o'chirish" tugmalarini to'g'ri
    // ko'rsatish uchun. FAQAT admin javobida: ochiq API'da ichki foydalanuvchi
    // id'si chiqmasligi kerak. Haqiqiy himoya serverda (bkl. utils/ownership.ts).
    authorId: news.authorId ?? null,
    publishedAt: toDateOnly(news.publishedAt),
    cover: news.cover,
    coverImage: news.coverImage ?? undefined,
    featured: news.featured,
    translations: news.translations.map((t: NewsTranslationRow) => ({
      locale: t.locale,
      slug: t.slug,
      title: t.title,
      excerpt: t.excerpt,
      body: t.body ?? undefined,
      metaTitle: t.metaTitle ?? undefined,
      metaDescription: t.metaDescription ?? undefined,
      ogTitle: t.ogTitle ?? undefined,
      ogDescription: t.ogDescription ?? undefined,
      ...serializeTranslationMeta(t),
    })),
  };
}

interface CategoryTranslationRow extends TranslationMetaRow {
  locale: string;
  label: string;
  description: string;
}

export function serializeCategoryAdmin(category: NewsCategory & { translations: CategoryTranslationRow[] }) {
  return {
    slug: category.slug,
    isSystem: category.isSystem,
    order: category.order,
    translations: category.translations.map((t: CategoryTranslationRow) => ({
      locale: t.locale,
      label: t.label,
      description: t.description,
      ...serializeTranslationMeta(t),
    })),
  };
}

interface TeamTranslationRow extends TranslationMetaRow {
  locale: string;
  role: string;
  description: string | null;
}

export function serializeTeamMemberAdmin(member: TeamMember & { translations: TeamTranslationRow[] }) {
  return {
    id: member.id,
    name: member.name,
    photo: member.photo ?? null,
    order: member.order,
    translations: member.translations.map((t: TeamTranslationRow) => ({
      locale: t.locale,
      role: t.role,
      description: t.description ?? undefined,
      ...serializeTranslationMeta(t),
    })),
  };
}

interface FaqTranslationRow extends TranslationMetaRow {
  locale: string;
  question: string;
  answer: string;
}

/** TTBS savoli — admin paneli uchun barcha tillardagi tarjimalari bilan. */
export function serializeFaqAdmin(item: FaqItem & { translations: FaqTranslationRow[] }) {
  return {
    id: item.id,
    order: item.order,
    translations: item.translations.map((t: FaqTranslationRow) => ({
      locale: t.locale,
      question: t.question,
      answer: t.answer,
      ...serializeTranslationMeta(t),
    })),
  };
}
