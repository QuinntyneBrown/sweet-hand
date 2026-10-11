import type { Request } from '../http/endpoint.ts';
import { fail, problem } from '../http/problems.ts';
import { recentEvents, recordEvent } from '../platform/throttle.ts';
import { hashIp } from '../platform/secrets.ts';
import { writeLog } from '../platform/log-redactor.ts';

const HOUR = 60 * 60_000;

/**
 * Per-IP hourly limits on the open launch list routes (L2-104.5): above the
 * limit the request gets 429 with `Retry-After`, otherwise it is counted.
 */
export async function throttleLaunchList(req: Request, kind: 'launch-sign-up' | 'launch-token', limit: number): Promise<void> {
  const recent = await recentEvents(req.tx, kind, req.ip, req.now, HOUR);
  if (recent.length >= limit) {
    const wait = Math.max(1, Math.ceil((Date.parse(recent[recent.length - limit]) + HOUR - req.now.getTime()) / 1000));
    writeLog({ level: 'security', type: 'rate-limit-block', path: req.path, ipHash: hashIp(req.ip), at: req.now.toISOString(), correlationId: req.correlationId });
    fail({ ...problem(429, 'Too many requests'), headers: { 'retry-after': String(wait) } });
  }
  await recordEvent(req.tx, kind, req.ip, req.now, HOUR);
}
