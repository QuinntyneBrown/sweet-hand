import { randomUUID } from 'node:crypto';
import type { Request } from '../http/router.ts';
import type { Caterer, Photo } from '../caterers/model.ts';
import { PRIVATE_MEDIA, type MediaObject } from '../platform/media.ts';

/** Media ids of uploaded photos; only these are ever deleted (seeded photos can be shared between profiles). */
const UPLOADED = 'upload-';

/**
 * Stores an accepted photo upload and runs it through the image service. The
 * photo's public media id holds only the processed image; while the service
 * is down the upload waits under a private id and the photo is "Processing"
 * (L2-041.5, L2-091.2).
 */
export async function storePhoto(req: Request, upload: MediaObject, extension: string): Promise<Pick<Photo, 'file' | 'processing'>> {
  const file = `${UPLOADED}${randomUUID()}.${extension}`;
  const processed = await req.env.images.process(upload);
  if (processed) {
    await req.env.media.put(file, processed);
    return { file, processing: undefined };
  }
  await req.env.media.put(PRIVATE_MEDIA + file, upload);
  return { file, processing: true };
}

/** Removes an uploaded photo's images once nothing refers to them (L2-042.2). */
export async function discardPhotoMedia(req: Request, file: string): Promise<void> {
  if (!file.startsWith(UPLOADED)) return;
  await req.env.media.delete(file);
  await req.env.media.delete(PRIVATE_MEDIA + file);
}

/** Retries processing of waiting uploads; true when any photo became ready (L2-091.2). */
export async function settleProcessing(req: Request, c: Caterer): Promise<boolean> {
  let changed = false;
  for (const photo of c.photos) {
    if (!photo.processing) continue;
    const waiting = await req.env.media.get(PRIVATE_MEDIA + photo.file);
    const processed = waiting && (await req.env.images.process(waiting));
    if (waiting && !processed) continue;
    if (processed) await req.env.media.put(photo.file, processed);
    await req.env.media.delete(PRIVATE_MEDIA + photo.file);
    delete photo.processing;
    changed = true;
  }
  return changed;
}
