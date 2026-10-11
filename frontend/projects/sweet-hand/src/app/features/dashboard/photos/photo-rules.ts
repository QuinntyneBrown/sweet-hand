import { OwnPhotoView, UploadRequest } from '@sweet-hand/api';

/** What the picker offers; the server checks the content itself (L2-041.3). */
export const PHOTO_TYPES = 'image/jpeg,image/png,image/webp,image/heic';
export const MAX_PHOTOS = 30;
/** Published profiles keep at least this many photos (L2-042.4). */
export const MIN_PUBLISHED_PHOTOS = 3;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export const photoSizeMessage = () => $localize`:@@photos.sizeError:Photos must be under 15 MB and at least 800 pixels on the shorter side`;

/** A file over 15 MB is refused before it is sent (L2-041.2). */
export function tooBig(file: File): boolean {
  return file.size > MAX_PHOTO_BYTES;
}

/** The file as the upload contract carries it. */
export function readUpload(file: File): Promise<UploadRequest> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      resolve({ fileName: file.name, data: url.slice(url.indexOf(',') + 1) });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** "6 of 30 · the first photo is your cover", "6 of 30 · uploading 2 more", "7 of 30 · 1 processing". */
export function photosSubtitle(photos: readonly OwnPhotoView[], uploading: number, readOnly: boolean): string {
  const n = photos.length;
  if (readOnly) {
    return n === 1 ? $localize`:@@photos.subtitleOne:1 photo · the first photo is your cover` : $localize`:@@photos.subtitleCount:${n}:count: photos · the first photo is your cover`;
  }
  if (!n && !uploading) return $localize`:@@photos.subtitleEmpty:Photos lead your listing. Add 3 to 30, each with a caption.`;
  if (uploading) return $localize`:@@photos.subtitleUploading:${n}:count: of 30 · uploading ${uploading}:more: more`;
  const processing = photos.filter((p) => p.state === 'Processing').length;
  if (processing) return $localize`:@@photos.subtitleProcessing:${n}:count: of 30 · ${processing}:processing: processing`;
  return $localize`:@@photos.subtitle:${n}:count: of 30 · the first photo is your cover`;
}
