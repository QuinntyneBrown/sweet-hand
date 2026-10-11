import { randomUUID } from 'node:crypto';
import type { Reply, Request } from '../http/endpoint.ts';
import { badRequest, conflict, fail, hidden, invalid, notFound, ok } from '../http/problems.ts';
import type { Photo } from '../caterers/model.ts';
import { assertEditable, loadOwn, reorder, saveCaterer, text, type Own } from './own.ts';
import { recordCoverChange } from './live-edits.ts';
import { removedPhotos } from './model.ts';
import { ownProfileReply } from './profile.ts';
import { discardPhotoMedia, flaggedUpload, restorePhotoMedia, storePhoto, withdrawPhotoMedia } from './processing.ts';
import { CONTENT_TYPES, EXTENSIONS, decodeUpload, dimensions, sniff, type FileKind } from './uploads.ts';
import { MAX_PHOTOS, MIN_PUBLISHED, photoView } from './view.ts';

const PHOTO_BYTES = 15 * 1024 * 1024;
/** Upload bodies are base64 JSON: 15 MB of photo is about 20 MB of request (L2-080.3). */
export const PHOTO_BODY_BYTES = 21 * 1024 * 1024;
const PHOTO_SIZE = 'Photos must be under 15 MB and at least 800 pixels on the shorter side';
const PHOTO_TYPE = 'This file isn’t a JPEG, PNG, WebP or HEIC photo, so nothing was saved';

/** A JPEG, PNG, WebP or HEIC of up to 15 MB, at least 800 pixels on the shorter side (L2-041.1–3). */
function checkedPhoto(body: unknown): { fileName: string; bytes: Buffer; kind: FileKind } {
  const file = decodeUpload(body);
  if (!file) return fail(invalid({ file: [PHOTO_TYPE] }));
  if (file.bytes.length > PHOTO_BYTES) fail(invalid({ file: [PHOTO_SIZE] }));
  const kind = sniff(file.bytes);
  if (!kind || kind === 'PDF') return fail(invalid({ file: [PHOTO_TYPE] }));
  // A size that cannot be read is refused too (L2-041.2).
  const size = dimensions(file.bytes, kind);
  if (!size || Math.min(size.width, size.height) < 800) fail(invalid({ file: [PHOTO_SIZE] }));
  return { ...file, kind };
}

async function editableOwn(req: Request): Promise<Own> {
  const own = await loadOwn(req);
  assertEditable(own.caterer);
  return own;
}

function photoOf(own: Own, id: string): Photo {
  return own.caterer.photos.find((p) => p.id === id) ?? fail(notFound());
}

async function store(req: Request, file: { bytes: Buffer; kind: FileKind }) {
  return storePhoto(req, { contentType: CONTENT_TYPES[file.kind], bytes: file.bytes }, EXTENSIONS[file.kind]);
}

/** `POST /api/caterer/profile/photos`: a new photo at the end, without a caption yet (L2-041, L2-042.3). */
export async function uploadPhoto(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  if (own.caterer.photos.length >= MAX_PHOTOS) return conflict('You can have up to 30 photos');
  const file = checkedPhoto(req.body);
  const flagged = await flaggedUpload(req, file.bytes);
  if (flagged) return flagged;
  const cover = own.caterer.photos[0];
  const { file: mediaId, processing } = await store(req, file);
  const photo: Photo = { id: `photo-${randomUUID()}`, file: mediaId, caption: '', fileName: file.fileName, ...(processing ? { processing } : {}) };
  own.caterer.photos.push(photo);
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ok(photoView(photo), 201);
}

/** `POST /api/caterer/profile/photos/:id/replacement`: the new image takes the old one's place and caption (L2-042.2). */
export async function replacePhoto(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const photo = photoOf(own, req.params['id']);
  const file = checkedPhoto(req.body);
  const flagged = await flaggedUpload(req, file.bytes);
  if (flagged) return flagged;
  const cover = { ...own.caterer.photos[0] };
  const old = photo.file;
  const { file: mediaId, processing } = await store(req, file);
  if (photo.pendingFile) await discardPhotoMedia(req, photo.pendingFile);
  if (processing && !photo.processing) {
    // The current image stays on the page until the replacement is ready (L2-042.2).
    photo.pendingFile = mediaId;
    photo.pendingFileName = file.fileName;
  } else {
    photo.file = mediaId;
    photo.fileName = file.fileName;
    delete photo.pendingFile;
    delete photo.pendingFileName;
    if (processing) photo.processing = true;
    else delete photo.processing;
    await discardPhotoMedia(req, old);
  }
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ok(photoView(photo));
}

/** `PATCH /api/caterer/profile/photos/:id`: caption of 5–125 characters, and "Use as cover photo" moves it to position 1 (L2-042.3, L2-042.6). */
export async function updatePhoto(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const photo = photoOf(own, req.params['id']);
  const caption = text(req.body?.caption);
  if (caption.length < 5 || caption.length > 125) return invalid({ caption: ['Captions describe the photo in 5–125 characters'] });
  const photos = own.caterer.photos;
  const cover = { ...photos[0] };
  photo.caption = caption;
  if (req.body?.useAsCover === true) own.caterer.photos = [photo, ...photos.filter((p) => p !== photo)];
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}

/** `PUT /api/caterer/profile/photos/order`: every photo id once; the first is the cover (L2-042.1). */
export async function reorderPhotos(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const next = reorder(own.caterer.photos, req.body?.photoIds);
  if (!next) return badRequest('Send every photo id once');
  const cover = own.caterer.photos[0];
  own.caterer.photos = next;
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}

/** `DELETE /api/caterer/profile/photos/:id`: off the page at once, kept for Undo; a Published profile keeps at least 3 (L2-042.4). */
export async function removePhoto(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const photo = photoOf(own, req.params['id']);
  if (own.caterer.status === 'Published' && own.caterer.photos.length <= MIN_PUBLISHED) return conflict('Published profiles need at least 3 photos');
  const cover = own.caterer.photos[0];
  const index = own.caterer.photos.indexOf(photo);
  own.caterer.photos.splice(index, 1);
  await removedPhotos(req.tx).put({ id: photo.id, catererId: own.caterer.id, photo, index, removedAt: req.now.toISOString() });
  // Off the page at once: its image is no longer served, but kept for Undo.
  await withdrawPhotoMedia(req, photo.file);
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}

/** `POST /api/caterer/profile/photos/:id/restoration`: Undo puts a removed photo back where it was. */
export async function restorePhoto(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const removed = await removedPhotos(req.tx).get(req.params['id']);
  if (!removed) return notFound();
  if (removed.catererId !== own.caterer.id) return hidden(removed.id);
  if (own.caterer.photos.length >= MAX_PHOTOS) return conflict('You can have up to 30 photos');
  const cover = own.caterer.photos[0];
  own.caterer.photos.splice(Math.min(removed.index, own.caterer.photos.length), 0, removed.photo);
  await removedPhotos(req.tx).delete(removed.id);
  await restorePhotoMedia(req, removed.photo.file);
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}
