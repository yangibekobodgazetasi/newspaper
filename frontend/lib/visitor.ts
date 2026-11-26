const VISITOR_KEY = 'yb_visitor_hash';

/**
 * Brauzerda saqlanadigan anonim tashrifchi identifikatori — analytics (VisitTracker) va
 * kunlik yuborish limitlari (murojaat/savol-javob) bir xil qiymatdan foydalanadi.
 */
export function getVisitorHash(): string {
  if (typeof window === 'undefined') return '';
  let hash = localStorage.getItem(VISITOR_KEY);
  if (!hash) {
    hash = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_KEY, hash);
  }
  return hash;
}
