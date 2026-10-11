/**
 * Uploads arrive as base64 JSON (`UploadRequest`). The type comes from the
 * content signature, never the name or the declared type (L2-041.3).
 */

export type FileKind = 'JPEG' | 'PNG' | 'WEBP' | 'HEIC' | 'PDF';

export interface Upload {
  fileName: string;
  bytes: Buffer;
}

export const CONTENT_TYPES: Record<FileKind, string> = { JPEG: 'image/jpeg', PNG: 'image/png', WEBP: 'image/webp', HEIC: 'image/heic', PDF: 'application/pdf' };
export const EXTENSIONS: Record<FileKind, string> = { JPEG: 'jpg', PNG: 'png', WEBP: 'webp', HEIC: 'heic', PDF: 'pdf' };

const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** The file of an `UploadRequest`, or undefined when the body is not one. */
export function decodeUpload(body: unknown): Upload | undefined {
  const b = body as { fileName?: unknown; data?: unknown } | undefined;
  if (!b || typeof b.data !== 'string' || typeof b.fileName !== 'string' || !BASE64.test(b.data)) return undefined;
  // The name is only ever shown back to its owner; keep it short and on one line.
  const fileName = b.fileName.replace(/[\r\n]/g, ' ').trim().slice(0, 200) || 'upload';
  return { fileName, bytes: Buffer.from(b.data, 'base64') };
}

export function sniff(bytes: Buffer): FileKind | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'PNG';
  if (bytes.length >= 12 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP') return 'WEBP';
  if (bytes.length >= 12 && bytes.toString('latin1', 4, 8) === 'ftyp' && /^(heic|heix|mif1|msf1|hevc)$/.test(bytes.toString('latin1', 8, 12))) return 'HEIC';
  if (bytes.length >= 5 && bytes.toString('latin1', 0, 5) === '%PDF-') return 'PDF';
  return undefined;
}

/** Width and height from a PNG header or a JPEG start-of-frame marker; undefined when unknown. */
export function dimensions(bytes: Buffer, kind: FileKind): { width: number; height: number } | undefined {
  if (kind === 'PNG' && bytes.length >= 24) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (kind === 'JPEG') {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return undefined;
      const marker = bytes[i + 1];
      const size = bytes.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
      }
      i += 2 + size;
    }
  }
  return undefined;
}
