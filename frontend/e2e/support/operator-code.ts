import { createHmac } from 'node:crypto';

/** Leah's authenticator secret in the backend's fictional seed (backend/src/seed/users.ts). */
const LEAH_SECRET = 'JBSWY3DPEHPK3PXPSWEETHAND';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** The RFC 6238 code Leah's authenticator app shows at `iso` (L2-056.2). */
export function operatorCodeAt(iso: string): string {
  const bits = [...LEAH_SECRET].map((ch) => ALPHABET.indexOf(ch).toString(2).padStart(5, '0')).join('');
  const key = Buffer.from((bits.match(/.{8}/g) ?? []).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.parse(iso) / 30_000)));
  const mac = createHmac('sha1', key).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}
