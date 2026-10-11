import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Reply } from './reply.ts';

/** What a route handler sees: the parsed request plus the caller's isolated store. */
export interface Ctx<S = unknown> {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
  headers: IncomingMessage['headers'];
  cookies: Record<string, string>;
  store: S;
  req: IncomingMessage;
  res: ServerResponse;
}

export const ok = (body: unknown, status = 200): Reply => ({ status, body });
export const noContent = (): Reply => ({ status: 204 });
export const notFound = (): Reply => ({ status: 404, body: { title: 'Not found' } });
export const forbidden = (): Reply => ({ status: 403, body: { title: 'Forbidden' } });
export const unauthorized = (): Reply => ({ status: 401, body: { title: 'Sign in to continue' } });
export const conflict = (title: string, extra: Record<string, unknown> = {}): Reply => ({
  status: 409,
  body: { title, ...extra },
});
/** RFC 9457 problem with per-field errors (ADR 0003). */
export const invalid = (errors: Record<string, string[]>, status = 400, title = 'Check the form'): Reply => ({
  status,
  body: { title, errors },
});

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  if (!chunks.length) return undefined;
  const text = Buffer.concat(chunks).toString('utf8');
  const type = req.headers['content-type'] ?? '';
  if (type.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }
  return text;
}
