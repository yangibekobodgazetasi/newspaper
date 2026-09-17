import multer from 'multer';
import path from 'path';
import { ISSUE_PDF_SPEC } from '../types/fileSpecs';
import { ApiError } from './errorHandler';

// Xotirada saqlaymiz — diskka yozishdan oldin sharp bilan o'lcham/format tekshiruvidan o'tkazamiz
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — aniq chegara validateImage.ts ichida kind bo'yicha tekshiriladi
});

/**
 * Gazeta soni PDF'i uchun alohida multer: rasmlarnikidan ancha katta chegara (20MB).
 *
 * `fileFilter` faylni O'QIB BO'LMASDAN OLDIN rad etadi — noto'g'ri formatdagi katta
 * fayl serverga to'liq yuklanib o'tirmaydi. Haqiqiy PDF ekanligi (imzo baytlari)
 * route ichida qo'shimcha tekshiriladi: kengaytma va MIME turini mijoz o'zi yozadi.
 */
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: ISSUE_PDF_SPEC.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const okExt = ISSUE_PDF_SPEC.allowedExtensions.includes(ext);
    const okMime = ISSUE_PDF_SPEC.allowedMimeTypes.includes(file.mimetype);

    if (!okExt || !okMime) {
      // ApiError — errorHandler uni 400 sifatida qaytaradi (oddiy Error 500 bo'lardi)
      cb(new ApiError(400, 'Faqat PDF fayl yuklash mumkin'));
      return;
    }
    cb(null, true);
  },
});
