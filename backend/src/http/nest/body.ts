import type { IncomingMessage } from 'node:http';

export const MB = 1024 * 1024;

export class BodyTooLarge extends Error {}
export class BadJson extends Error {}

/** Control characters other than tab and newline are removed from every string (L2-080.4). */
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(CONTROL, '');
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (k !== '__proto__') out[k] = sanitize(v);
    return out;
  }
  return value;
}

/** Reads a JSON body of at most `limit` bytes as strict UTF-8, sanitised; anything else is no body. */
export async function readBody(req: IncomingMessage, limit: number): Promise<unknown> {
  const declared = Number(req.headers['content-length'] ?? 0);
  if (declared > limit) throw new BodyTooLarge();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new BodyTooLarge();
    chunks.push(chunk as Buffer);
  }
  if (!size) return undefined;
  const type = req.headers['content-type'] ?? '';
  if (!type.includes('application/json')) return undefined;
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
  } catch {
    throw new BadJson();
  }
  try {
    return sanitize(JSON.parse(text));
  } catch {
    throw new BadJson();
  }
}
