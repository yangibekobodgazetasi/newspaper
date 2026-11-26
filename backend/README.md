# Yangi Bekobod — Backend API

Express + TypeScript + Prisma + PostgreSQL. Barcha route'lar frontenddagi
`data/api/*.json` kontraktlariga aynan mos yozilgan.

## O'rnatish

```bash
npm install
cp .env.example .env
# .env faylidagi DATABASE_URL'ni o'z PostgreSQL ma'lumotlaringizga moslang
```

## Ma'lumotlar bazasini sozlash

```bash
npx prisma generate      # Prisma Client generatsiya qilish (internet talab qiladi)
npx prisma migrate dev   # jadvallarni yaratish
npm run prisma:seed      # frontenddagi namunaviy datani bazaga yuklash
```

> **Eslatma:** Ushbu kod sandbox muhitida yozilgan bo'lib, u yerda
> `binaries.prisma.sh` domeniga tarmoq kirishi yo'q edi — shuning uchun
> `npx prisma generate` shu yerda ishlab ko'rilmadi (403 xatosi tarmoq
> cheklovidan, kod xatosidan emas). Oddiy internet ulanishi bo'lgan
> muhitingizda muammosiz ishlaydi. Generatsiyadan so'ng barcha
> TypeScript xatolari (`@prisma/client`dagi "no exported member")
> avtomatik yo'qoladi.

## Ishga tushirish

```bash
npm run dev     # ts-node-dev bilan hot-reload
npm run build   # dist/ ga compile qilish
npm start       # production
```

Server: `http://localhost:4000`, health-check: `GET /health`

## Loyiha tuzilishi

```
prisma/
  schema.prisma       ← barcha modellar (News, Issue, MediaItem, TeamMember,
                         StaticContent, Survey, ForumTopic, QuestionAnswer,
                         FaqItem, Subscriber, ContactMessage, AdminUser)
  seed.ts             ← frontend/data/*.json fayllaridan bazani to'ldiradi
  seed-data/*.json    ← shu maqsadda ko'chirilgan namunaviy data

src/
  app.ts, server.ts
  lib/prisma.ts               ← PrismaClient singleton
  middleware/asyncHandler.ts  ← try/catch takrorlanishining oldini oladi (DRY)
  middleware/errorHandler.ts  ← markazlashgan xato javoblari
  utils/pagination.ts         ← { items, page, pageSize, total } konverti
  utils/serializers.ts        ← Prisma yozuvi → frontend JSON shakli
  types/constants.ts          ← NEWS_CATEGORY_SLUGS va h.k. (frontend bilan bir xil)
  routes/
    news.routes.ts       → /api/news/:category, /api/news/:category/:slug, /api/news/media-galereya
    issues.routes.ts     → /api/issues, /api/issues/:id
    about.routes.ts      → /api/about, /api/about/:slug
    contact.routes.ts    → /api/contact/manzil|rekvizitlar|qabul-jadvali|xaridorlar-uchun, POST /murojaat
    services.routes.ts   → /api/services/sorov(+vote), forum(+POST), savol-javob(+POST), ttbs, POST obuna
    team.routes.ts       → /api/team
```

## Frontend bilan ulash

Next.js frontendda statik JSON importlarni (`data/news.json` va h.k.) shu API'ga
`fetch` chaqiruviga almashtirasiz, masalan:

```ts
// oldin:
import newsData from '@/data/news.json';

// keyin:
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/kundalik-yangiliklar`);
const { items } = await res.json();
```

Javob shakli `data/api/*.json` fayllaridagi kontraktlar bilan bir xil bo'lgani
uchun frontend komponentlarida deyarli hech narsa o'zgartirish shart emas.

## Admin panel uchun eslatma

`AdminUser` modeli va `AdminRole` enumi (`SUPER_ADMIN`, `BOSH_MUHARRIR`, `MUXBIR`,
`DIZAYNER`, `MODERATOR`) tayyor. Seed skripti ishga tushirilganda boshlang'ich
super admin yaratiladi: **admin@yangibekobod.uz / ChangeMe123!** — birinchi
kirishdan so'ng albatta almashtiring.

### Admin API route'lari (`/api/admin/...`, JWT bilan himoyalangan)

| Route | Method | Ruxsat | Tavsif |
|---|---|---|---|
| `/api/admin/auth/login` | POST | ochiq | Kirish, JWT token qaytaradi |
| `/api/admin/dashboard` | GET | har qanday admin | Statistika: sonlar, obunachilar, kutilayotgan savollar |
| `/api/admin/news` | GET/POST/PUT/DELETE | STAFF | Yangiliklar CRUD (draft holatidan qat'iy nazar) |
| `/api/admin/issues` | GET/POST/PUT/DELETE | STAFF | Sonlar arxivi CRUD |
| `/api/admin/team` | GET/POST/PUT/DELETE | STAFF | Jamoa a'zolari CRUD |
| `/api/admin/static-content/:key` | GET/PUT | STAFF | "Biz haqimizda"/"Aloqalar" CMS (masalan `about:hamkorlik`) |
| `/api/admin/users` | GET/POST/PUT/DELETE | SUPER_ADMIN | Foydalanuvchilar va rollar |
| `/api/admin/forum` | GET/DELETE | MODERATOR+ | Forum moderatsiyasi |
| `/api/admin/questions` | GET, PUT `/:id/answer` | MODERATOR+ | Savol-javobga javob berish |
| `/api/admin/subscribers` | GET/DELETE | STAFF | Obunachilar ro'yxati va o'chirish |
| `/api/admin/surveys` | GET/POST, PATCH `/:id/close` | PUBLISHER | So'rov yaratish/yopish |
| `/api/admin/media/specs` | GET | STAFF | Har bir rasm turi uchun talab qilinadigan o'lcham |
| `/api/admin/media` | GET | STAFF | Yuklangan rasmlar ro'yxati (`?kind=NEWS_COVER`) |
| `/api/admin/media/upload` | POST (multipart) | STAFF | Rasm yuklash — o'lcham/format avtomatik tekshiriladi |
| `/api/admin/media/:id` | DELETE | STAFF | Rasmni o'chirish |

`STAFF` = SUPER_ADMIN, BOSH_MUHARRIR, MUXBIR, DIZAYNER.
`MODERATOR+` = SUPER_ADMIN, BOSH_MUHARRIR, MODERATOR.
`PUBLISHER` = SUPER_ADMIN, BOSH_MUHARRIR.

Har bir so'rovda `Authorization: Bearer <token>` header talab qilinadi
(login'dan qaytgan token). `.env`ga albatta uzun, tasodifiy `JWT_SECRET`
qo'ying.

## Yangiliklar slug'i — avtomatik generatsiya

`POST /api/admin/news` endi `slug`ni client'dan qabul qilmaydi — backend uni
sarlavhadan avtomatik yasaydi (`src/utils/slug.ts`) va bazadagi eski
yozuvlar bilan to'qnashmasligi uchun kerak bo'lsa `-2`, `-3` ... qo'shib
unikal qiladi. Tahrirlashda (`PUT`) slug o'zgarmaydi — havolalar buzilmasligi
uchun barqaror qoladi.

## Yangiliklar toifalari — endi dinamik

Yangi `NewsCategory` modeli qo'shildi. 6 ta "tizim" toifasi
(`kundalik-yangiliklar`, `ommaviy-tadbirlar`, `rahbariyat-bayonotlari`,
`oav-biz-haqimizda`, `elonlar`, `media-galereya`) `isSystem: true` bilan seed
qilingan va o'chirib bo'lmaydi (frontend routing ularga bog'liq). Admin
panelda ulardan tashqari **yangi toifalar qo'shish** mumkin:

| Route | Method | Ruxsat | Tavsif |
|---|---|---|---|
| `/api/news/categories` | GET | ochiq | Barcha toifalar (public frontend uchun) |
| `/api/admin/categories` | GET/POST | STAFF | Ro'yxat, yangi toifa qo'shish |
| `/api/admin/categories/:slug` | PUT/DELETE | STAFF | Tahrirlash, o'chirish (tizim toifalari himoyalangan) |

## Media galereya — endi haqiqiy rasm bilan

`MediaItem` modeliga `imageUrl` qo'shildi. Admin CRUD:

| Route | Method | Ruxsat |
|---|---|---|
| `/api/admin/gallery` | GET/POST | STAFF |
| `/api/admin/gallery/:id` | PUT/DELETE | STAFF |

## Rasm spetsifikatsiyalari — kengroq tolerantlik

`HERO_BANNER` uchun minimal kenglik **930px**gacha pasaytirildi (avval 1520px
talab qilinardi) — haqiqiy foto/AI-generatsiya qilingan rasmlar odatda aynan
1600×900 bo'lmagani uchun. Aspekt nisbati tolerantligi 3%dan 8%ga oshirildi.
Har bir turda endi alohida `minWidth` maydoni bor (`src/types/imageSpecs.ts`).

## Rasmlar boshqaruvi (Media)


Frontendning har bir joyida ishlatiladigan rasm turi va talab qilinadigan
o'lchami `src/types/imageSpecs.ts`da aniqlangan (sayt skrinshotlari tahlili
asosida):

| Kind | Qayerda ishlatiladi | Aspekt | 1x | 2x |
|---|---|---|---|---|
| `HERO_BANNER` | Bosh sahifa banneri | 16:9 | 1600×900 | 3200×1800 |
| `NEWS_COVER` | Yangiliklar grid/kartochka | 4:3 | 800×600 | 1600×1200 |
| `ISSUE_COVER` | Sonlar arxivi muqovasi | 3:4 | 600×800 | 1200×1600 |
| `TEAM_PHOTO` | Jamoa a'zosi portreti | 1:1 | 400×400 | 800×800 |
| `GALLERY_IMAGE` | Media galereya | 4:3 | 800×600 | 1600×1200 |
| `PARTNER_LOGO` | Hamkorlik sahifasi logotipi | 2:1 | 240×120 | 480×240 |
| `SITE_LOGO` | Header/footer logotipi | 1:1 | 256×256 | 512×512 |

Yuklashda backend (`sharp` orqali) formatni, aspekt nisbatini (±3% tolerantlik)
va o'lchamni (kamida 1x, 2x bo'lsa "Retina" deb belgilanadi) tekshiradi — mos
kelmasa aniq xabar bilan rad etadi. Fayllar `uploads/<kind>/` papkasiga
saqlanadi va `/uploads/...` orqali statik xizmat qiladi.

## Obunachilar

`Subscriber` modeli endi **telefon raqamini majburiy** (`phone`, unique) va
emailni ixtiyoriy qiladi — obuna formasi endi ism-familiya + telefon raqami
so'raydi (`POST /api/services/obuna`). Admin panelda obunachilarni ko'rish va
o'chirish mumkin.

> **Eslatma:** Frontend (`yangi-bekobod`) tarafidagi `data/api/services-obuna-post.json`
> kontrakti va `SubscribeForm` komponenti hali eski (email-based) holatda —
> bu safar faqat backend va admin panelga o'zgartirish kiritildi, frontendni
> alohida bosqichda yangilaymiz.

## Yangiliklar rasmlari va "Bosh materiallar"

`News` modeliga `coverImage` (haqiqiy yuklangan rasm URL'i) qo'shildi —
`cover` (gradient) endi faqat rasm hali yuklanmagan holatlar uchun fallback.
Admin panelda har bir yangilik uchun rasm `MediaAsset` kutubxonasidan tanlanadi:
- Oddiy yangiliklar → `NEWS_COVER` turi (4:3, 800×600)
- **Bosh materiallar** (`featured: true`, bosh sahifa hero karuselida chiqadi) →
  `HERO_BANNER` turi (16:9, 1600×900 — kattaroq va sifatliroq)

## Sayt tashriflari (analitika)

Yangi `SiteVisit` modeli va route'lar:

| Route | Method | Ruxsat | Tavsif |
|---|---|---|---|
| `/api/analytics/visit` | POST | ochiq | Frontend har bir sahifa ochilganda chaqiradi (auth shart emas) |
| `/api/admin/analytics/visits?range=daily\|weekly\|monthly\|yearly` | GET | har qanday admin | Grafiklar uchun agregatsiya qilingan tashrif statistikasi |

Dashboard javobiga (`GET /api/admin/dashboard`) `counts.visitsLast24h` qo'shildi.

> **Eslatma:** Bu ham backend tayyor, lekin `yangi-bekobod` (public frontend)
> hali har bir sahifada `POST /api/analytics/visit`ni chaqirmaydi — buni
> alohida bosqichda frontendga qo'shamiz.
# nb-backend
