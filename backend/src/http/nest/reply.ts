import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import type { Reply, Request } from '../endpoint.ts';

const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
  'cache-control': 'no-store',
};

/** Headers every response carries (L2-081.3, L2-089.1). */
export function applyStandardHeaders(res: Response, correlationId: string, secureCookies: boolean): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  res.setHeader('x-correlation-id', correlationId);
  if (secureCookies) res.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains');
}

/**
 * Applies a use case's reply to the response: status, its headers, the
 * cookies set during the request, and the content type. Returns the body for
 * Nest to send: JSON, a file for raw bodies, or nothing.
 */
export function prepareReply(res: Response, ctx: Request | undefined, reply: Reply): unknown {
  res.status(reply.status);
  for (const [name, value] of Object.entries(reply.headers ?? {})) res.setHeader(name, value);
  if (ctx?.cookiesOut.length) res.setHeader('set-cookie', ctx.cookiesOut);
  if (reply.raw !== undefined) return new StreamableFile(typeof reply.raw === 'string' ? Buffer.from(reply.raw) : reply.raw);
  if (reply.body === undefined) return undefined;
  res.setHeader('content-type', reply.status >= 400 ? 'application/problem+json' : 'application/json');
  return reply.body;
}

/** Writes a reply directly, for answers given outside a handler (refusals, problems, errors). */
export function sendReply(res: Response, ctx: Request | undefined, reply: Reply): void {
  const body = prepareReply(res, ctx, reply);
  if (body instanceof StreamableFile) body.getStream().pipe(res);
  else if (body === undefined) res.end();
  else res.end(JSON.stringify(body));
}
