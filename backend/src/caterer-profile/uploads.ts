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

/** Width and height of a WebP: lossy (VP8), lossless (VP8L) or extended (VP8X) header. */
function webpSize(bytes: Buffer): { width: number; height: number } | undefined {
  const chunk = bytes.toString('latin1', 12, 16);
  if (chunk === 'VP8X' && bytes.length >= 30) return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
    const bits = bytes.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
  }
  if (chunk === 'VP8 ' && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  return undefined;
}

/** Width and height of a HEIC from its image spatial extents (`ispe`) property. */
function heicSize(bytes: Buffer): { width: number; height: number } | undefined {
  const at = bytes.indexOf('ispe', 0, 'latin1');
  if (at < 0 || at + 16 > bytes.length) return undefined;
  return { width: bytes.readUInt32BE(at + 8), height: bytes.readUInt32BE(at + 12) };
}

/** Width and height from the file's own header (PNG, JPEG, WebP, HEIC); undefined when it cannot be read. */
export function dimensions(bytes: Buffer, kind: FileKind): { width: number; height: number } | undefined {
  if (kind === 'WEBP') return webpSize(bytes);
  if (kind === 'HEIC') return heicSize(bytes);
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
