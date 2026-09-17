import { api } from './api';

export interface NewsAuthorOption {
  id: string;
  name: string;
}

export interface NewsAuthorsResult {
  items: NewsAuthorOption[];
  /** Jamoada bo'lmagan, lekin bazada avval ishlatilgan muallif ismlari — "Boshqa" rejimidagi taklif ro'yxati uchun. */
  externalSuggestions: string[];
}

/**
 * Yangilik formasidagi "Muallif" ro'yxati — jamoa a'zolarining ismlari, shuningdek
 * jamoadan tashqari (masalan xaridor/tashqi muxbir) avval ishlatilgan ismlar ro'yxati.
 *
 * Ataylab `/admin/team` EMAS: u `team:view` huquqini talab qiladi va muxbirda
 * bu huquq yo'q. `/admin/news/authors` esa news router'ining o'z guard'i
 * ostida turadi, shuning uchun yangilik yarata oladigan har qanday rol uni
 * o'qiy oladi (bkl. backend/src/routes/admin/news.routes.ts).
 *
 * Ism tarjima qilinmaydi (`TeamMember.name` — bitta maydon), shuning uchun
 * ro'yxat tildan qat'i nazar bir xil bo'ladi.
 */
export async function getNewsAuthors(): Promise<NewsAuthorsResult> {
  return api.get<NewsAuthorsResult>('/admin/news/authors');
}
