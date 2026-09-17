# Yangi Bekobod — Admin panel

Next.js 14 + TypeScript + SCSS. Backend'dagi `/api/admin/*` route'lariga JWT orqali ulanadi.

## O'rnatish

```bash
npm install
```

`.env.local` yarating:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Ishga tushirish

```bash
npm run dev     # http://localhost:3001
```

Birinchi kirish: **admin@yangibekobod.uz / ChangeMe123!** (backend seed skriptidan) —
kirgach albatta o'zingizning parolingizga almashtiring (`Foydalanuvchilar va rollar`
sahifasida yangi super admin yaratib, eskisini o'chirishingiz mumkin).

## Tekshiruv

`tsc --noEmit` — 0 xato. `npm run build` — barcha 20 sahifa muvaffaqiyatli
generatsiya qilingan (bu loyihadagi barcha sahifalar client-side render
qilingani uchun backend build vaqtida ishlab turishi shart emas).

## Ekranlar (13 ta)

| Ekran | Yo'l | Ruxsat |
|---|---|---|
| Login | `/login` | ochiq |
| Dashboard | `/dashboard` | har qanday admin |
| Bosh materiallar | `/news/featured`, `/news/featured/new` | STAFF |
| Yangiliklar | `/news`, `/news/new`, `/news/[id]` | STAFF |
| Sonlar arxivi | `/issues`, `/issues/new`, `/issues/[id]` | STAFF |
| Biz haqimizda (CMS) | `/content/about` | STAFF |
| Aloqalar (CMS) | `/content/contact` | STAFF |
| So'rovlar | `/surveys` | PUBLISHER |
| Forum moderatsiyasi | `/forum` | MODERATOR+ |
| Savol-javob | `/questions` | MODERATOR+ |
| Obunachilar | `/subscribers` | STAFF |
| Jamoa | `/team`, `/team/new`, `/team/[id]` | STAFF |
| Foydalanuvchilar va rollar | `/users` | SUPER_ADMIN |
| Rasmlar | `/media` | STAFF |
| Sozlamalar | `/settings` | STAFF |

## Arxitektura eslatmalari

- **Rasmlar (`/media`)**: backend `src/types/imageSpecs.ts`da belgilangan 7 ta
  rasm turi (HERO_BANNER, NEWS_COVER, ISSUE_COVER, TEAM_PHOTO, GALLERY_IMAGE,
  PARTNER_LOGO, SITE_LOGO) bo'yicha tab orqali yuklanadi. Har bir tur uchun
  talab qilinadigan aspekt nisbati, 1x/2x piksel o'lchami va maksimal fayl
  hajmi ekranda ko'rsatiladi; yuklashda backend (`sharp` orqali) buni
  avtomatik tekshiradi va mos kelmasa aniq xabar bilan rad etadi.
- **Obunachilar**: endi telefon raqami asosiy identifikator (email ixtiyoriy).
  Ro'yxatdan o'chirish mumkin.

- **Autentifikatsiya**: client-side, JWT `localStorage`da saqlanadi
  (`lib/api.ts`). `RequireAuth` komponenti har bir `(dashboard)` sahifasini
  himoyalaydi — token bo'lmasa `/login`ga yo'naltiradi. Bu demo/MVP darajasidagi
  yondashuv; production uchun httpOnly cookie + Next.js middleware bilan
  kuchaytirish tavsiya etiladi.
- **"Biz haqimizda"/"Aloqalar" CMS**: har sahifaning tarkibi turlicha
  tuzilgani sababli (ro'yxat, jadval, oddiy matn) alohida forma yasash o'rniga
  umumiy JSON-tahrirlagich ishlatilgan (`components/content/JsonContentEditor`).
- **DataTable, Button, FormField va h.k.** — barcha ro'yxat/forma sahifalarida
  qayta ishlatiladigan generic komponentlar (DRY).
- **Sozlamalar** sahifasi hozircha `settings:general` kaliti ostida saqlanadi,
  lekin frontendga hali ulanmagan — keyingi bosqichda backend'ga
  `/api/settings` route'i qo'shilganda ulanadi.
- **Yangiliklar rasmlari**: har bir yangilik (`NewsForm`) endi `/media`
  bo'limida yuklangan rasmlar orasidan tanlaydi (`ImagePicker`). Oddiy
  yangiliklar `NEWS_COVER` (4:3), **Bosh materiallar** esa `HERO_BANNER`
  (16:9, kattaroq/sifatliroq) turidan tanlaydi.
- **Dashboard grafigi**: `VisitsChart` komponenti Recharts yordamida
  kunlik/haftalik/oylik/yillik tashrif statistikasini chizadi
  (`/api/admin/analytics/visits`). 24 soatlik son alohida stat-karta
  sifatida ham ko'rsatiladi.
# nb-admin
