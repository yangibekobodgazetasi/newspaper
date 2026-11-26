import sharp from 'sharp';
import { IMAGE_SPECS, type MediaKind } from '../types/imageSpecs';

export interface ImageValidationResult {
  valid: boolean;
  message?: string;
  width: number;
  height: number;
  scale?: '1x' | '2x';
}

// Haqiqiy foto/generatsiya qilingan rasmlar hech qachon piksel-perfekt bo'lmaydi,
// shuning uchun aspekt nisbatida 8% gacha farqga yo'l qo'yamiz.
const ASPECT_TOLERANCE = 0.08;

/**
 * Rasm buferini spesifikatsiya bilan solishtiradi:
 * 1) format ruxsat etilganmi
 * 2) aspekt nisbati mos keladimi (tolerantlik bilan)
 * 3) kengligi spec.minWidth'dan kichik emasmi
 */
export async function validateImage(buffer: Buffer, kind: MediaKind): Promise<ImageValidationResult> {
  const spec = IMAGE_SPECS[kind];
  const metadata = await sharp(buffer).metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const format = metadata.format ?? '';

  if (!spec.allowedFormats.includes(format)) {
    return {
      valid: false,
      width,
      height,
      message: `Format qo'llab-quvvatlanmaydi (${format}). Ruxsat etilgan: ${spec.allowedFormats.join(', ')}`,
    };
  }

  const actualRatio = width / height;
  const ratioDiff = Math.abs(actualRatio - spec.aspectRatio) / spec.aspectRatio;

  if (ratioDiff > ASPECT_TOLERANCE) {
    return {
      valid: false,
      width,
      height,
      message: `Aspekt nisbati mos kelmadi. Tavsiya etiladi: ${spec.width1x}×${spec.height1x} (yoki ${spec.width2x}×${spec.height2x}), yuklangan: ${width}×${height}`,
    };
  }

  if (width < spec.minWidth) {
    return {
      valid: false,
      width,
      height,
      message: `Rasm juda kichik. Kamida ${spec.minWidth}px kenglikda bo'lishi kerak (tavsiya etiladi: ${spec.width1x}×${spec.height1x}), yuklangan: ${width}×${height}`,
    };
  }

  const scale = width >= spec.width2x * 0.9 ? '2x' : '1x';

  return { valid: true, width, height, scale };
}
