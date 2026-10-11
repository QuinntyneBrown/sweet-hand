import { randomUUID } from 'node:crypto';
import type { Reply, Request } from '../http/router.ts';
import { conflict, fail, invalid, notFound, ok } from '../http/problems.ts';
import type { Photo } from '../caterers/model.ts';
import { assertEditable, loadOwn, saveCaterer, type Own } from './own.ts';
import { recordCoverChange } from './live-edits.ts';
import { discardPhotoMedia, storePhoto } from './processing.ts';
import { CONTENT_TYPES, EXTENSIONS, decodeUpload, dimensions, sniff, type FileKind } from './uploads.ts';
import { MAX_PHOTOS, photoView } from './view.ts';

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
  const size = dimensions(file.bytes, kind);
  if (size && Math.min(size.width, size.height) < 800) fail(invalid({ file: [PHOTO_SIZE] }));
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
  const cover = { ...own.caterer.photos[0] };
  const old = photo.file;
  const { file: mediaId, processing } = await store(req, file);
  photo.file = mediaId;
  photo.fileName = file.fileName;
  if (processing) photo.processing = true;
  else delete photo.processing;
  await discardPhotoMedia(req, old);
  await recordCoverChange(req, own, cover);
  await saveCaterer(req, own.caterer);
  return ok(photoView(photo));
}
