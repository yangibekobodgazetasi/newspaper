import 'dotenv/config';
import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`✅ Yangi Bekobod API http://localhost:${PORT} portida ishga tushdi`);
});
