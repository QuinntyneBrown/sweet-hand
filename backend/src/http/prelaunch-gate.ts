import type { IncomingMessage, ServerResponse } from 'node:http';

const ALLOWED = new Set([
  '/api/public/launch-list',
  '/api/launch-list/sign-ups',
  '/api/launch-list/confirmations',
  '/api/launch-list/removals',
  '/api/launch-list/unsubscribe',
  '/health/live',
  '/health/ready',
]);

export function isAllowedPrelaunchPath(path: string): boolean {
  return ALLOWED.has(path);
}

/** Conceals unfinished product endpoints before NestJS route selection. */
export function prelaunchGate(req: IncomingMessage, res: ServerResponse): boolean {
  const path = new URL(req.url ?? '/', 'http://internal').pathname;
  if (isAllowedPrelaunchPath(path)) return false;
  res.statusCode = 404;
  res.setHeader('content-type', 'application/problem+json');
  res.end(JSON.stringify({ type: 'about:blank', title: 'Not found', status: 404 }));
  return true;
}
