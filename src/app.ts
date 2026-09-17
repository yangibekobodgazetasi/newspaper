import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Render (va shunga o'xshash) hostinglarda ilova bitta reverse-proxy ortida ishlaydi.
  // Raqamli qiymat `X-Forwarded-For`ni FAQAT shuncha "hop" chuqurlikda (o'ngdan) ishonchli deb
  // hisoblaydi — mijoz o'zi yuborgan soxta header qatorlarini e'tiborsiz qoldiradi. Bu qiymatsiz
  // (yoki `true`) qo'yilsa, IP-asoslangan rate limiting osongina chetlab o'tiladi.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1);

  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // Yuklangan rasmlar (yangiliklar, sonlar, jamoa, media va h.k.) shu manzil orqali xizmat qiladi
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
