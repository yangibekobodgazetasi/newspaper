/**
 * Yengil mock API server — haqiqiy backend (Prisma/Postgres) hali tayyor
 * bo'lmagan paytda frontendni mahalliy ishga tushirish/build qilish uchun.
 * data/*.json fayllaridan foydalanadi, 26 ta route kontraktiga mos javob beradi.
 *
 * Ishlatish: node scripts/mock-api-server.js
 */
const express = require('express');
const cors = require('cors');
const news = require('../data/news.json');
const issues = require('../data/issues.json');
const media = require('../data/media.json');
const team = require('../data/team.json');
const about = require('../data/about.json');
const contact = require('../data/contact.json');
const services = require('../data/services.json');

const app = express();
app.use(cors());
app.use(express.json());

const categories = [
  { slug: 'kundalik-yangiliklar', label: 'Kundalik yangiliklar', description: "Tumanning kundalik hayotidan so'nggi yangiliklar", isSystem: true },
  { slug: 'ommaviy-tadbirlar', label: 'Ommaviy tadbirlar', description: "O'tkazilgan yig'in, bayram va tantanali tadbirlar haqida", isSystem: true },
  { slug: 'rahbariyat-bayonotlari', label: 'Rahbariyatning chiqishlari va bayonotlari', description: 'Boshqaruv organi vakillarining rasmiy chiqishlari', isSystem: true },
  { slug: 'oav-biz-haqimizda', label: 'OAV biz haqimizda', description: "\"Yangi Bekobod\" DM faoliyati boshqa OAVlar tilidan", isSystem: true },
  { slug: 'elonlar', label: "E'lonlar", description: "Muassasaga kelib tushgan rasmiy e'lonlar", isSystem: true },
  { slug: 'media-galereya', label: 'Media galereya', description: 'Tuman hayotidan fotolavhalar', isSystem: true },
];

// ---- Toifalar ----
app.get('/api/news/categories', (req, res) => res.json({ items: categories }));

// ---- Analitika ----
app.post('/api/analytics/visit', (req, res) => res.status(201).json({ success: true }));

function paginate(items, req) {
  const page = parseInt(req.query.page || '1', 10);
  const pageSize = parseInt(req.query.pageSize || '12', 10);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length };
}

// ---- News ----
app.get('/api/news/media-galereya', (req, res) => res.json(paginate(media, req)));
app.get('/api/news/:category', (req, res) => {
  const items = news.filter((n) => n.rubricSlug === req.params.category);
  res.json(paginate(items, req));
});
app.get('/api/news/:category/:slug', (req, res) => {
  const item = news.find((n) => n.rubricSlug === req.params.category && n.slug === req.params.slug);
  if (!item) return res.status(404).json({ success: false, message: 'Topilmadi' });
  res.json(item);
});

// ---- Issues ----
app.get('/api/issues', (req, res) => res.json(paginate(issues, req)));
app.get('/api/issues/:id', (req, res) => {
  const issue = issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ success: false, message: 'Topilmadi' });
  res.json(issue);
});

// ---- About ----
app.get('/api/about', (req, res) => res.json(about.umumiy));
app.get('/api/about/:slug', (req, res) => {
  const content = about[req.params.slug];
  if (!content) return res.status(404).json({ success: false, message: 'Topilmadi' });
  res.json(content);
});

// ---- Contact ----
app.get('/api/contact/manzil', (req, res) => res.json(contact.manzil));
app.get('/api/contact/rekvizitlar', (req, res) => res.json(contact.rekvizitlar));
app.get('/api/contact/qabul-jadvali', (req, res) => res.json({ schedule: contact.qabulJadvali }));
app.get('/api/contact/xaridorlar-uchun', (req, res) => res.json(contact.xaridorlarUchun));
app.post('/api/contact/murojaat', (req, res) => {
  const ticketId = `M-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  res.status(201).json({ success: true, ticketId });
});

// ---- Team ----
app.get('/api/team', (req, res) => res.json({ items: team }));

// ---- Services ----
app.get('/api/services/sorov', (req, res) => res.json(services.survey));
app.post('/api/services/sorov/:id/vote', (req, res) => res.json({ success: true }));
app.get('/api/services/forum', (req, res) => res.json(paginate(services.forumTopics, req)));
app.post('/api/services/forum', (req, res) => res.status(201).json({ id: 'mock-id', success: true }));
app.get('/api/services/savol-javob', (req, res) => res.json(paginate(services.questions, req)));
app.post('/api/services/savol-javob', (req, res) => res.status(201).json({ id: 'mock-id', status: 'pending', success: true }));
app.get('/api/services/ttbs', (req, res) => res.json({ items: services.faq }));
app.post('/api/services/obuna', (req, res) => res.status(201).json({ success: true, message: 'Obuna muvaffaqiyatli amalga oshirildi' }));

const PORT = process.env.MOCK_API_PORT || 4000;
app.listen(PORT, () => console.log(`🧪 Mock API http://localhost:${PORT} portida ishga tushdi`));
