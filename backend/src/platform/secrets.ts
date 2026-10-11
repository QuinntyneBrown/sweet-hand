import { createHash, createHmac, randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';

/** Argon2id with at least 19 MiB and 2 iterations (L2-076.2); the salt is random per hash. */
/** `algorithm: 2` is Argon2id (the package's const enum cannot be imported under type stripping). */
const ARGON2 = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string): Promise<string> => hash(password, ARGON2);

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  try {
    return await verify(stored, password);
  } catch {
    return false;
  }
}

let dummy: Promise<string> | undefined;
/** Spends the same time as a real check, so an unknown email is not faster (L2-076.3). */
export async function verifyAgainstNothing(password: string): Promise<false> {
  dummy ??= hashPassword(randomToken());
  await verifyPassword(await dummy, password);
  return false;
}

/** 256 random bits, URL-safe (session cookies, links). */
export const randomToken = (): string => randomBytes(32).toString('base64url');

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

const IP_KEY = process.env['IP_HASH_SECRET'] ?? 'sweet-hand-local-ip-key';
/** IP addresses are only ever kept as a keyed hash (L2-084.1). */
export const hashIp = (ip: string): string => createHmac('sha256', IP_KEY).update(ip).digest('hex').slice(0, 32);
