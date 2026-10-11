import { randomUUID } from 'node:crypto';
import type { Request } from '../http/endpoint.ts';
import type { Environment } from '../environment.ts';
import { invalid } from '../http/problems.ts';
import type { Reply } from '../http/endpoint.ts';
import { caterers, type Caterer, type Photo } from '../caterers/model.ts';
import { PRIVATE_MEDIA, type MediaObject } from '../platform/media.ts';
import { recordSecurityEvent } from '../platform/security-log.ts';

/** Media ids of uploaded photos; only these are ever deleted (seeded photos can be shared between profiles). */
const UPLOADED = 'upload-';

export const FLAGGED_FILE = 'This file can’t be used, so nothing was saved';

/**
 * Scans an upload before anything is stored (L2-041.6). A flagged file is
 * refused and the event is logged; the reply is returned, not thrown, so the
 * security event commits.
 */
export async function flaggedUpload(req: Request, bytes: Buffer): Promise<Reply | undefined> {
  if ((await req.env.scanner.scan(bytes)) === 'clean') return undefined;
  await recordSecurityEvent(req, 'upload-rejected');
  return invalid({ file: [FLAGGED_FILE] });
}

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
export async function discardPhotoMedia(req: Pick<Request, 'env'>, file: string): Promise<void> {
  if (!file.startsWith(UPLOADED)) return;
  await req.env.media.delete(file);
  await req.env.media.delete(PRIVATE_MEDIA + file);
}

/** Takes an uploaded photo off public view without losing it, so Undo can bring it back. */
export async function withdrawPhotoMedia(req: Pick<Request, 'env'>, file: string): Promise<void> {
  if (!file.startsWith(UPLOADED)) return;
  const image = await req.env.media.get(file);
  if (!image) return;
  await req.env.media.put(PRIVATE_MEDIA + file, image);
  await req.env.media.delete(file);
}

/** Puts a withdrawn photo back on public view (Undo). */
export async function restorePhotoMedia(req: Pick<Request, 'env'>, file: string): Promise<void> {
  if (!file.startsWith(UPLOADED)) return;
  const image = await req.env.media.get(PRIVATE_MEDIA + file);
  if (!image) return;
  await req.env.media.put(file, image);
  await req.env.media.delete(PRIVATE_MEDIA + file);
}

/** Ready photos: the only ones anyone but the caterer sees (manage-photos design). */
export const readyPhotos = (c: Pick<Caterer, 'photos'>): Photo[] => c.photos.filter((p) => !p.processing);

/**
 * Retries processing of waiting uploads and pending replacements; true when
 * anything changed (L2-091.2, L2-042.2). A replacement swaps in, and the old
 * image goes, only once the new one is ready.
 */
export async function settleProcessing(env: Environment, c: Caterer): Promise<boolean> {
  let changed = false;
  for (const photo of c.photos) {
    if (photo.processing) {
      const waiting = await env.media.get(PRIVATE_MEDIA + photo.file);
      const processed = waiting && (await env.images.process(waiting));
      if (waiting && !processed) continue;
      if (processed) await env.media.put(photo.file, processed);
      await env.media.delete(PRIVATE_MEDIA + photo.file);
      delete photo.processing;
      changed = true;
    }
    if (photo.pendingFile) {
      const waiting = await env.media.get(PRIVATE_MEDIA + photo.pendingFile);
      const processed = waiting && (await env.images.process(waiting));
      if (waiting && !processed) continue;
      const old = photo.file;
      if (processed) {
        await env.media.put(photo.pendingFile, processed);
        photo.file = photo.pendingFile;
        photo.fileName = photo.pendingFileName ?? photo.fileName;
      }
      await env.media.delete(PRIVATE_MEDIA + photo.pendingFile);
      delete photo.pendingFile;
      delete photo.pendingFileName;
      if (processed) await discardPhotoMedia({ env }, old);
      changed = true;
    }
  }
  return changed;
}

/**
 * The scheduled processing run (degrade-gracefully design, ProcessPhotoJob):
 * finishes every waiting upload once the image service is back, so photos
 * publish without the caterer opening their profile (L2-091.2).
 */
export async function processWaitingPhotos(env: Environment): Promise<number> {
  const waiting = await env.db.transaction(async (tx) =>
    (await caterers(tx).all()).filter((c) => c.photos.some((p) => p.processing || p.pendingFile)).map((c) => c.id),
  );
  let settled = 0;
  for (const id of waiting) {
    await env.db.transaction(async (tx) => {
      const c = await caterers(tx).get(id);
      if (c && (await settleProcessing(env, c))) {
        await caterers(tx).put(c);
        settled++;
      }
    });
  }
  return settled;
}
