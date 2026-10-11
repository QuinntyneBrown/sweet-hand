import { randomUUID } from 'node:crypto';
import type { Environment } from '../environment.ts';
import type { Request } from '../http/endpoint.ts';
import type { Transaction } from '../platform/database.ts';

/**
 * The context a scheduled job hands to a use case it shares with an endpoint
 * (for example, account deletion): no caller, no cookies, its own correlation id.
 */
export function systemRequest(env: Environment, tx: Transaction, job: string): Request {
  return {
    method: 'JOB',
    path: `/jobs/${job}`,
    params: {},
    query: new URLSearchParams(),
    body: undefined,
    headers: {},
    cookies: {},
    ip: '',
    correlationId: `job-${randomUUID()}`,
    env,
    tx,
    now: env.clock.now(),
    cookiesOut: [],
    locals: {},
  };
}
