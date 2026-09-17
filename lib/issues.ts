import { api, uploadFile } from './api';
import type { PdfSpec, UploadedPdf } from '@/types';

/**
 * PDF chegaralari backenddan olinadi (`types/fileSpecs.ts`) — admin panelda
 * takroriy konstanta yozilmagan, shuning uchun frontend va backend validatsiyasi
 * hech qachon bir-biridan ajralib qolmaydi.
 */
export async function getPdfSpec(): Promise<PdfSpec> {
  return api.get<PdfSpec>('/admin/issues/pdf-spec');
}

export async function uploadIssuePdf(file: File): Promise<UploadedPdf> {
  const form = new FormData();
  form.append('file', file);
  return uploadFile<UploadedPdf>('/admin/issues/upload-pdf', form);
}
