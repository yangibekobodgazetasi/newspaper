/**
 * Har bir frontend sahifasiga mos backend route uchun JSON kontrakt fayl generatsiya qiladi.
 * Ishlatish: node scripts/generate-api-contracts.js
 * Natija: data/api/*.json — 22 ta fayl, backend jamoasi shu shakl bo'yicha endpoint yozadi.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'data', 'api');

const routes = [
  // ---- 1. Gazeta haqida ----
  {
    file: 'about-umumiy',
    method: 'GET',
    path: '/api/about',
    description: '"Yangi Bekobod" gazetasi haqida umumiy ma\'lumot',
    response: {
      title: "\"Yangi Bekobod\" gazetasi haqida",
      foundedYear: 1931,
      founder: 'Bekobod tumani hokimligi',
      body: '<p>HTML yoki Markdown formatidagi kontent...</p>',
      updatedAt: '2026-06-01T00:00:00Z',
    },
  },
  {
    file: 'about-maqsad-vazifalar',
    method: 'GET',
    path: '/api/about/maqsad-va-vazifalar',
    description: 'Gazetaning maqsad va vazifalari',
    response: { title: 'Maqsad va vazifalar', body: '<p>...</p>', updatedAt: '2026-06-01T00:00:00Z' },
  },
  {
    file: 'about-hamkorlik',
    method: 'GET',
    path: '/api/about/hamkorlik',
    description: "\"Yangi Bekobod\" DM bilan hamkor tashkilotlar haqida ma'lumot",
    response: {
      partners: [
        { id: 'p1', name: 'Bekobod tumani hokimligi', logo: '/partners/hokimlik.png', url: null },
        { id: 'p2', name: "O'zbekiston Matbuot va axborot agentligi", logo: '/partners/uzmatbuot.png', url: null },
      ],
      updatedAt: '2026-06-01T00:00:00Z',
    },
  },
  {
    file: 'about-korrupsiyaga-qarshi-kurashish',
    method: 'GET',
    path: '/api/about/korrupsiyaga-qarshi-kurashish',
    description: "Muassasada korrupsiyaning har qanday shakliga nisbatan murosasizlik siyosati",
    response: {
      title: 'Korrupsiyaga qarshi kurashish',
      body: '<p>...</p>',
      hotline: '1003',
      trustLineUrl: 'https://ishonch.uz',
      updatedAt: '2026-06-01T00:00:00Z',
    },
  },

  // ---- 2. Sonlar arxivi ----
  {
    file: 'issues-list',
    method: 'GET',
    path: '/api/issues?page=1&pageSize=20',
    description: "\"Yangi Bekobod\" gazetasining barcha sonlari (haftalik yangilanadi)",
    response: {
      items: [
        { id: '8043', number: 25, date: '2026-06-30', pages: 8, fileSize: '4.2 MB', pdfUrl: '/issues/8043.pdf', coverImage: '/issues/8043-cover.jpg' },
      ],
      page: 1,
      pageSize: 20,
      total: 25,
    },
  },
  {
    file: 'issues-detail',
    method: 'GET',
    path: '/api/issues/:id',
    description: 'Bitta sonning to\'liq ma\'lumoti (masalan PDF ochish sahifasi uchun)',
    response: { id: '8043', number: 25, date: '2026-06-30', pages: 8, fileSize: '4.2 MB', pdfUrl: '/issues/8043.pdf', coverImage: '/issues/8043-cover.jpg' },
  },

  // ---- 3. Yangiliklar (6 kichik toifa) ----
  {
    file: 'news-kundalik-yangiliklar',
    method: 'GET',
    path: '/api/news/kundalik-yangiliklar?page=1&pageSize=12',
    description: 'Tumanning kundalik yangiliklari',
    response: {
      items: [
        { id: 'n-2026-06-30-01', slug: 'yoshlar-bilan-uchrashuv', rubric: 'Rahbariyat', rubricSlug: 'kundalik-yangiliklar', title: 'Prezidentimiz yoshlar bilan uchrashib, yangi tashabbuslarni ilgari surdi', excerpt: '...', body: '<p>To\'liq matn...</p>', author: 'Sarvinoz SHERALIYEVA', publishedAt: '2026-06-30', cover: 'gradient-1', featured: true },
      ],
      page: 1,
      pageSize: 12,
      total: 48,
    },
  },
  {
    file: 'news-ommaviy-tadbirlar',
    method: 'GET',
    path: '/api/news/ommaviy-tadbirlar?page=1&pageSize=12',
    description: "O'tkazilgan ommaviy tadbirlar haqida ma'lumotlar",
    response: { items: [], page: 1, pageSize: 12, total: 0 },
  },
  {
    file: 'news-rahbariyat-bayonotlari',
    method: 'GET',
    path: '/api/news/rahbariyat-bayonotlari?page=1&pageSize=12',
    description: 'Boshqaruv organi vakillarining chiqishlari va bayonotlari',
    response: { items: [], page: 1, pageSize: 12, total: 0 },
  },
  {
    file: 'news-oav-biz-haqimizda',
    method: 'GET',
    path: '/api/news/oav-biz-haqimizda?page=1&pageSize=12',
    description: '"Yangi Bekobod" DM faoliyati haqida boshqa OAVlarda e\'lon qilingan materiallar',
    response: { items: [], page: 1, pageSize: 12, total: 0 },
  },
  {
    file: 'news-elonlar',
    method: 'GET',
    path: "/api/news/elonlar?page=1&pageSize=12",
    description: 'Muassasaga kelib tushgan e\'lonlar',
    response: {
      items: [
        { id: 'a1', title: 'Olmaliq DTI Bekobod filialiga 400 nafar talaba qabul qilinadi', meta: 'sentabrdan', publishedAt: '2026-06-15', body: '<p>...</p>' },
      ],
      page: 1,
      pageSize: 12,
      total: 6,
    },
  },
  {
    file: 'news-media-galereya',
    method: 'GET',
    path: '/api/news/media-galereya?page=1&pageSize=24',
    description: 'Tuman hayotidan fotosuratlar',
    response: {
      items: [
        { id: 'g1', imageUrl: '/gallery/2026-06-30-01.jpg', caption: "Yoshlar kuni tantanasi", publishedAt: '2026-06-30' },
      ],
      page: 1,
      pageSize: 24,
      total: 120,
    },
  },

  // ---- 4. Interaktiv xizmatlar ----
  {
    file: 'services-sorov',
    method: 'GET',
    path: '/api/services/sorov',
    description: 'Faol so\'rovnoma va uning natijalari',
    response: {
      id: 's1',
      question: "Gazetaning qaysi rukni sizga eng ko'p yoqadi?",
      options: [
        { id: 'o1', label: 'Shodiyona', votes: 120 },
        { id: 'o2', label: 'Jarayon', votes: 45 },
      ],
      isActive: true,
      endsAt: '2026-07-31T00:00:00Z',
    },
  },
  {
    file: 'services-sorov-post',
    method: 'POST',
    path: '/api/services/sorov/:id/vote',
    description: "So'rovga ovoz berish",
    request: { optionId: 'o1' },
    response: { success: true },
  },
  {
    file: 'services-forum',
    method: 'GET',
    path: '/api/services/forum?page=1&pageSize=20',
    description: "O'quvchilar bilan ochiq muhokama maydoni — mavzular ro'yxati",
    response: {
      items: [
        { id: 'f1', title: "Yangi yo'l qurilishi haqida fikringiz", authorName: 'Anvar', createdAt: '2026-06-20T10:00:00Z', replyCount: 5, lastReplyAt: '2026-06-25T14:00:00Z' },
      ],
      page: 1,
      pageSize: 20,
      total: 34,
    },
  },
  {
    file: 'services-forum-post',
    method: 'POST',
    path: '/api/services/forum',
    description: 'Yangi forum mavzusi ochish',
    request: { title: 'Mavzu sarlavhasi', body: 'Matn...', authorName: 'Anvar', authorEmail: 'anvar@example.com' },
    response: { id: 'f35', success: true },
  },
  {
    file: 'services-savol-javob',
    method: 'GET',
    path: '/api/services/savol-javob?page=1&pageSize=20',
    description: 'Muharririyatga yuborilgan savol-javoblar',
    response: {
      items: [
        { id: 'q1', question: 'Obuna qanday amalga oshiriladi?', answer: "Elektron obuna orqali bepul.", askedBy: 'Nodira', status: 'answered', createdAt: '2026-06-10T09:00:00Z' },
      ],
      page: 1,
      pageSize: 20,
      total: 12,
    },
  },
  {
    file: 'services-savol-javob-post',
    method: 'POST',
    path: '/api/services/savol-javob',
    description: 'Yangi savol yuborish',
    request: { question: 'Savol matni', askedBy: 'Ism', email: 'ism@example.com' },
    response: { id: 'q13', status: 'pending', success: true },
  },
  {
    file: 'services-ttbs',
    method: 'GET',
    path: '/api/services/ttbs',
    description: 'Tez-tez beriladigan savollar',
    response: {
      items: [
        { id: 'faq1', question: "Gazetaga qanday obuna bo'lish mumkin?", answer: 'Sayt orqali yoki pochta bo\'limlari orqali.' },
      ],
    },
  },
  {
    file: 'services-obuna-post',
    method: 'POST',
    path: '/api/services/obuna',
    description: 'Elektron obuna yozilish',
    request: { fullName: 'Ism Familiya', email: 'email@example.com', locale: 'uz-latin' },
    response: { success: true, message: "Obuna muvaffaqiyatli amalga oshirildi" },
  },

  // ---- 5. Bizning jamoa ----
  {
    file: 'team-list',
    method: 'GET',
    path: '/api/team',
    description: "\"Yangi Bekobod\" DMning xodimlari haqidagi ma'lumotlar",
    response: {
      items: [
        { id: 't1', name: 'Sarvinoz Sheraliyeva', role: 'Bosh muharrir', photo: '/team/sarvinoz.jpg', email: null, phone: null },
      ],
    },
  },

  // ---- 6. Aloqalar ----
  {
    file: 'contact-manzil',
    method: 'GET',
    path: '/api/contact/manzil',
    description: 'Tashkilot manzili va aloqa kanallari',
    response: { address: '"Zafar" shaharchasi, hokimiyat binosi, 3-qavat', phone: '(998) 55 902 59 94', email: 'yangibekobod@umail.uz', mapLat: 40.2168, mapLng: 69.2762 },
  },
  {
    file: 'contact-rekvizitlar',
    method: 'GET',
    path: '/api/contact/rekvizitlar',
    description: 'Tashkilotning rasmiy rekvizitlari',
    response: { founder: 'Bekobod tumani hokimligi', legalAddress: '...', bankAccount: null, inn: null, issn: '2091-5497' },
  },
  {
    file: 'contact-qabul-jadvali',
    method: 'GET',
    path: '/api/contact/qabul-jadvali',
    description: 'Rahbariyatning fuqarolarni qabul qilish tartibi va jadvali',
    response: {
      schedule: [
        { day: 'Dushanba', hours: '09:00–12:00', person: 'Bosh muharrir Sarvinoz Sheraliyeva' },
      ],
    },
  },
  {
    file: 'contact-xaridorlar-uchun',
    method: 'GET',
    path: '/api/contact/xaridorlar-uchun',
    description: "Xaridorlar (obunachilar) uchun ma'lumot",
    response: { title: 'Xaridorlar uchun', body: '<p>Obuna narxlari, yetkazib berish tartibi...</p>' },
  },
  {
    file: 'contact-murojaat-post',
    method: 'POST',
    path: '/api/contact/murojaat',
    description: 'Murojaat formasini yuborish (Nav\'dagi "Murojaat qoldirish" tugmasi)',
    request: { fullName: 'Ism Familiya', phone: '+998901234567', email: 'ism@example.com', subject: 'Mavzu', message: 'Matn...' },
    response: { success: true, ticketId: 'M-2026-0456' },
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const route of routes) {
  const { file, ...contract } = route;
  const filePath = path.join(OUT_DIR, `${file}.json`);
  fs.writeFileSync(filePath, JSON.stringify(contract, null, 2) + '\n');
}

console.log(`${routes.length} ta API kontrakt fayli yaratildi: ${OUT_DIR}`);
