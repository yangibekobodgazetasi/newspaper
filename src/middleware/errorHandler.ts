import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Topilmadi') {
    super(404, message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Ma'lumotlar noto'g'ri kiritildi",
      errors: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  // Multer chegaradan oshgan faylni o'zi to'xtatadi — bu foydalanuvchi xatosi, server
  // xatosi emas, shuning uchun 500 emas, tushunarli 413/400 qaytaramiz.
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'Fayl hajmi ruxsat etilgan chegaradan katta' });
    }
    return res.status(400).json({ success: false, message: `Fayl yuklashda xatolik: ${err.message}` });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'Server xatosi yuz berdi' });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.method} ${req.originalUrl}` });
}
