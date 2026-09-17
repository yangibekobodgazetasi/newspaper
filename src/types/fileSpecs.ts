/**
 * PDF (gazeta soni) fayllari uchun yagona spetsifikatsiya.
 *
 * MUHIM: bu qiymatlar admin panelga `GET /api/admin/issues/pdf-spec` orqali beriladi,
 * ya'ni frontend va backend validatsiyasi AYNAN bir xil chegaralardan foydalanadi.
 * Admin panelda alohida konstanta yozib qo'yilmagan — aks holda ikkalasi vaqt o'tishi
 * bilan bir-biridan uzilib qolardi (rasmlar uchun `IMAGE_SPECS` bilan bir xil yondashuv).
 */
export interface PdfSpec {
  label: string;
  maxFileSizeMb: number;
  /** Brauzer `accept` atributi uchun */
  accept: string;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
}

export const ISSUE_PDF_SPEC: PdfSpec = {
  label: 'Gazeta soni (PDF)',
  maxFileSizeMb: 20,
  accept: 'application/pdf,.pdf',
  allowedExtensions: ['.pdf'],
  allowedMimeTypes: ['application/pdf'],
};

/** PDF fayllarining boshidagi imzo — kengaytmasi almashtirilgan fayllarni ushlaydi. */
export const PDF_MAGIC_BYTES = '%PDF-';

/** Bayt hajmini odam o'qiydigan ko'rinishga aylantiradi ("4.2 MB") — Issue.fileSize maydoni shu formatda. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
