import { flaggedUpload } from './processing.ts';
import { randomUUID } from 'node:crypto';
import type { Reply, Request } from '../http/endpoint.ts';
import { conflict, invalid, notFound, ok } from '../http/problems.ts';
import { PRIVATE_MEDIA } from '../platform/media.ts';
import { torontoDate } from '../discovery/listing.ts';
import { assertCertificateEditable, loadOwn, saveCaterer, text, type Own } from './own.ts';
import { CONTENT_TYPES, EXTENSIONS, decodeUpload, sniff } from './uploads.ts';
import { certificateView } from './view.ts';

const CERTIFICATE_BYTES = 10 * 1024 * 1024;
/** A 10 MB copy is about 14 MB of base64 JSON (L2-080.3). */
export const CERTIFICATE_BODY_BYTES = 14 * 1024 * 1024;
const NOT_A_COPY = 'This file isn’t a PDF, JPEG or PNG, so nothing was saved';

async function certificateOwn(req: Request): Promise<Own> {
  const own = await loadOwn(req);
  assertCertificateEditable(own.caterer);
  return own;
}

/** `PUT /api/caterer/profile/certificate`: holder, issuer, number and an expiry date that is not past (L2-040.1). */
export async function saveCertificate(req: Request): Promise<Reply> {
  const own = await certificateOwn(req);
  const b = req.body ?? {};
  const errors: Record<string, string[]> = {};
  if (!text(b.holder)) errors['holder'] = ['Enter the name on the certificate'];
  if (!text(b.issuer)) errors['issuer'] = ['Enter who issued the certificate'];
  if (!text(b.number)) errors['number'] = ['Enter the certificate number'];
  const expires = text(b.expires);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expires) || Number.isNaN(Date.parse(expires))) errors['expires'] = ['Enter the expiry date'];
  else if (expires < torontoDate(req.now)) errors['expires'] = ['This certificate has expired'];
  if (Object.keys(errors).length) return invalid(errors);
  own.caterer.certificate = {
    ...own.caterer.certificate,
    holder: text(b.holder),
    issuer: text(b.issuer),
    number: text(b.number).toUpperCase(),
    expires,
    savedAt: req.now.toISOString(),
  };
  await saveCaterer(req, own.caterer);
  return ok(certificateView(own.caterer));
}

/** `POST /api/caterer/profile/certificate/file`: a PDF, JPEG or PNG of up to 10 MB, stored privately (L2-040, L2-040.4). */
export async function uploadCertificateFile(req: Request): Promise<Reply> {
  const own = await certificateOwn(req);
  const cert = own.caterer.certificate;
  if (!cert) return conflict('Save the certificate details first');
  const file = decodeUpload(req.body);
  const kind = file && sniff(file.bytes);
  if (!file || !kind || kind === 'WEBP' || kind === 'HEIC') return invalid({ file: [NOT_A_COPY] });
  if (file.bytes.length > CERTIFICATE_BYTES) return invalid({ file: ['Certificate copies must be a PDF, JPEG or PNG of up to 10 MB'] });
  // Scanned before it is stored (provide-food-handler-certificate design).
  const flagged = await flaggedUpload(req, file.bytes);
  if (flagged) return flagged;
  // Private media is never served by the public media route.
  const mediaId = `${PRIVATE_MEDIA}certificate-${randomUUID()}.${EXTENSIONS[kind]}`;
  await req.env.media.put(mediaId, { contentType: CONTENT_TYPES[kind], bytes: file.bytes });
  if (cert.fileMediaId) await req.env.media.delete(cert.fileMediaId);
  Object.assign(cert, { fileName: file.fileName, fileSize: file.bytes.length, fileType: kind, fileMediaId: mediaId, fileUploadedAt: req.now.toISOString() });
  await saveCaterer(req, own.caterer);
  return ok(certificateView(own.caterer), 201);
}

/** `DELETE /api/caterer/profile/certificate/file`: the copy is deleted from storage. */
export async function removeCertificateFile(req: Request): Promise<Reply> {
  const own = await certificateOwn(req);
  const cert = own.caterer.certificate;
  if (!cert?.fileName) return notFound();
  if (cert.fileMediaId) await req.env.media.delete(cert.fileMediaId);
  delete cert.fileName;
  delete cert.fileSize;
  delete cert.fileType;
  delete cert.fileMediaId;
  delete cert.fileUploadedAt;
  await saveCaterer(req, own.caterer);
  return ok(certificateView(own.caterer));
}
