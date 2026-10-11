import { createHmac, timingSafeEqual } from 'node:crypto';

const STEP_SECONDS = 30;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32(secret: string): Buffer {
  let bits = '';
  for (const ch of secret.replace(/=+$/, '').toUpperCase()) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) throw new Error('Invalid base32 secret');
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map((b) => parseInt(b, 2)));
}

/** The RFC 6238 code (HMAC-SHA1, 30 seconds, 6 digits) an authenticator app shows at `at`. */
export function totp(secret: string, at: Date, stepOffset = 0): string {
  const counter = Math.floor(at.getTime() / 1000 / STEP_SECONDS) + stepOffset;
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac('sha1', base32(secret)).update(msg).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const value = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(value).padStart(6, '0');
}

/** Accepts the current code and one step either side, for clock drift. */
export function verifyTotp(secret: string, code: unknown, at: Date): boolean {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return false;
  return [-1, 0, 1].some((step) => timingSafeEqual(Buffer.from(totp(secret, at, step)), Buffer.from(code)));
}
