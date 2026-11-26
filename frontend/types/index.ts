// ============================================
// YANGI BEKOBOD — umumiy TypeScript tiplari
// Bu fayl frontend komponentlari UCHUN yagona tip manbai.
// Backend API javoblari `data/api/*.json` fayllaridagi
// kengaytirilgan kontraktlarga mos bo'lishi kerak (README.md'ga qarang).
// ============================================

export type CoverVariant = 'gradient-1' | 'gradient-2' | 'gradient-3' | 'gradient-4';

/** Toifa slug'i — endi backend'da dinamik boshqariladi (NewsCategory jadvali), shuning uchun ochiq string */
export type NewsCategorySlug = string;

export interface NewsItem {
  id: string;
  slug: string;
  rubric: string;             // masalan: "Shodiyona", "G'alla — 2026"
  rubricSlug: NewsCategorySlug;
  title: string;
  excerpt: string;
  body?: string;
  author: string;
  publishedAt: string;        // "YYYY-MM-DD"
  cover: CoverVariant;
  coverImage?: string;         // haqiqiy yuklangan rasm (backend /uploads/... yo'li)
  featured?: boolean;
  /**
   * Shu maqolaning har bir tildagi slug'i: { uz: "...", ru: "...", en: "..." }.
   * Faqat detail endpoint (`/news/:category/:slug`) qaytaradi — ro'yxatlarda bo'lmaydi.
   * hreflang/alternate havolalarini qurish uchun ishlatiladi.
   */
  slugs?: Record<string, string>;
}

export interface Issue {
  id: string;        // gazeta buyurtma raqami, masalan "8043"
  number: number;    // son tartib raqami, masalan 25
  date: string;       // "YYYY-MM-DD"
  pages: number;
  fileSize: string;   // "4.2 MB"
  pdfUrl: string;
  /** PDF fayli serverda haqiqatan bormi — `false` bo'lsa yuklab olish tugmasi ko'rsatilmaydi. */
  pdfAvailable: boolean;
  coverImage?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
}

export interface MediaItem {
  id: string;
  cover: CoverVariant;
  imageUrl?: string;
  caption: string;
  publishedAt: string;
}

export interface NavChild {
  labelKey: string;
  href: string;
}

export interface NavItem {
  labelKey: string;
  href: string;
  children?: NavChild[];
}

export interface Language {
  code: string;
  label: string;
}

export interface WidgetItem {
  href: string;
  title: string;
  meta?: string;
  announce?: boolean;
}

export type ButtonVariant = 'primary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

// ---- "Biz haqimizda" bo'limi ----

export interface Partner {
  id: string;
  name: string;
  logo: string | null;
}

/**
 * Bosh sahifadagi "Bekobod — imkoniyatlar shahri" promo kartasi — admin panelda
 * boshqariladi (`home:promo` statik kontent kaliti). Ikkala maydon ham ixtiyoriy:
 * `null` bo'lsa karta standart holatida (tarjima matni + gradient fon) qoladi.
 */
export interface HomePromo {
  heading: string | null;
  image: string | null;
}

/** Bosh sahifadagi "Haftalik statistika" vidjeti — haqiqiy sondagi ma'lumot (bkl. lib/home.ts). */
export interface HomeStats {
  discussions: number;
  subscribers: number;
}

export interface AboutContent {
  title: string;
  intro: string;
  body: string[];      // paragraflar
  goals?: string[];    // faqat "Maqsad va vazifalar" uchun
  partners?: Partner[]; // faqat "Hamkorlik" uchun
  hotline?: string;     // faqat "Korrupsiyaga qarshi kurashish" uchun
  trustLineUrl?: string;
}

// ---- "Aloqalar" bo'limi ----

export interface ReceptionSlot {
  day: string;
  hours: string;
  person: string;
}

export interface ContactManzil {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapLat: number;
  mapLng: number;
}

export interface Requisites {
  founder: string;
  legalAddress: string;
  bankAccount: string | null;
  inn: string | null;
  issn: string;
}

// ---- "Interaktiv xizmatlar" bo'limi ----

export interface SurveyOption {
  id: string;
  label: string;
  votes: number;
}

export interface Survey {
  id: string;
  question: string;
  options: SurveyOption[];
  isActive: boolean;
}

export interface ForumTopic {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string; // ISO
  replyCount: number;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string | null;
  askedBy: string;
  status: 'pending' | 'answered';
  createdAt: string; // "YYYY-MM-DD"
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
