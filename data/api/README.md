# API kontraktlar — backend uchun qo'llanma

Bu papkadagi har bir `.json` fayl **bitta backend route**ning shaklini (contract) ko'rsatadi:
`method`, `path`, `description`, va (agar bo'lsa) `request` / `response` namunasi.

Backend (Express/Prisma) shu fayllardagi `response` tuzilmasiga mos JSON qaytarishi kerak —
frontend keyingi bosqichda `fetch('/api/...')` ga o'tganda shu shakldan foydalanadi.

Fayllar qayta generatsiya qilinishi kerak bo'lsa: `node scripts/generate-api-contracts.js`
(manba: `scripts/generate-api-contracts.js` ichidagi `routes` massivi — shu yerni tahrirlang, JSON fayllarni qo'lda emas).

## Route xaritasi (26 ta: 22 sahifa + 4 ta POST amal)

| Fayl | Method | Path | Frontend sahifa |
|---|---|---|---|
| about-umumiy | GET | /api/about | /gazeta-haqida |
| about-maqsad-vazifalar | GET | /api/about/maqsad-va-vazifalar | /gazeta-haqida/maqsad-va-vazifalar |
| about-hamkorlik | GET | /api/about/hamkorlik | /gazeta-haqida/hamkorlik |
| about-korrupsiyaga-qarshi-kurashish | GET | /api/about/korrupsiyaga-qarshi-kurashish | /gazeta-haqida/korrupsiyaga-qarshi-kurashish |
| issues-list | GET | /api/issues | /sonlar-arxivi |
| issues-detail | GET | /api/issues/:id | /sonlar-arxivi/[id] |
| news-kundalik-yangiliklar | GET | /api/news/kundalik-yangiliklar | /yangiliklar/kundalik-yangiliklar |
| news-ommaviy-tadbirlar | GET | /api/news/ommaviy-tadbirlar | /yangiliklar/ommaviy-tadbirlar |
| news-rahbariyat-bayonotlari | GET | /api/news/rahbariyat-bayonotlari | /yangiliklar/rahbariyat-bayonotlari |
| news-oav-biz-haqimizda | GET | /api/news/oav-biz-haqimizda | /yangiliklar/oav-biz-haqimizda |
| news-elonlar | GET | /api/news/elonlar | /yangiliklar/elonlar |
| news-media-galereya | GET | /api/news/media-galereya | /yangiliklar/media-galereya |
| services-sorov | GET | /api/services/sorov | /xizmatlar/sorov |
| services-sorov-post | POST | /api/services/sorov/:id/vote | /xizmatlar/sorov (ovoz berish) |
| services-forum | GET | /api/services/forum | /xizmatlar/forum |
| services-forum-post | POST | /api/services/forum | /xizmatlar/forum (yangi mavzu) |
| services-savol-javob | GET | /api/services/savol-javob | /xizmatlar/savol-javob |
| services-savol-javob-post | POST | /api/services/savol-javob | /xizmatlar/savol-javob (savol yuborish) |
| services-ttbs | GET | /api/services/ttbs | /xizmatlar/ttbs |
| services-obuna-post | POST | /api/services/obuna | /xizmatlar/obuna |
| team-list | GET | /api/team | /jamoa |
| contact-manzil | GET | /api/contact/manzil | /aloqalar/manzil |
| contact-rekvizitlar | GET | /api/contact/rekvizitlar | /aloqalar/rekvizitlar |
| contact-qabul-jadvali | GET | /api/contact/qabul-jadvali | /aloqalar/qabul-jadvali |
| contact-xaridorlar-uchun | GET | /api/contact/xaridorlar-uchun | /aloqalar/xaridorlar-uchun |
| contact-murojaat-post | POST | /api/contact/murojaat | Nav "Murojaat qoldirish" |

## Eslatma
- Paginatsiya qaytaruvchi route'lar bir xil konvertga ega: `{ items, page, pageSize, total }`.
- `rubricSlug` / `NewsCategorySlug` qiymatlari `types/index.ts` bilan bir xil bo'lishi shart — backend enum sifatida ham shu qiymatlarni ishlatsin.
- Sana formatlari: ro'yxatlarda `YYYY-MM-DD`, vaqt tamg'alari kerak bo'lgan joylarda to'liq ISO 8601 (`...T00:00:00Z`).
