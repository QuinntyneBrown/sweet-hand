import type { IncomingHttpHeaders } from 'node:http';
import type { Transaction } from '../platform/database.ts';
import type { Environment } from '../environment.ts';

export type Role = 'Customer' | 'Caterer' | 'Operator';

/**
 * Who may call an endpoint (authorise-requests design). Every route declares
 * one; anonymous access is always an explicit choice (AGENTS.md).
 */
export type Policy = { kind: 'anonymous' } | { kind: 'roles'; roles: Role[]; admin?: boolean };

export const anonymous: Policy = { kind: 'anonymous' };
export const roles = (...allowed: Role[]): Policy => ({ kind: 'roles', roles: allowed });
/** Operators with the Admin permission (L2-056.5). */
export const admins: Policy = { kind: 'roles', roles: ['Operator'], admin: true };
export const signedIn: Policy = roles('Customer', 'Caterer', 'Operator');

/** The signed-in caller, resolved from the session cookie before the policy check. */
export interface Actor {
  userId: string;
  role: Role;
  admin: boolean;
  /** Public id of the session (never the cookie value). */
  sessionId: string;
}

export interface Request {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
  headers: IncomingHttpHeaders;
  cookies: Record<string, string>;
  /** The client's address; only ever stored hashed (L2-084.2). */
  ip: string;
  correlationId: string;
  env: Environment;
  tx: Transaction;
  /** The request's instant from the environment's clock. */
  now: Date;
  actor?: Actor;
  /** `Set-Cookie` values to add to the reply. */
  cookiesOut: string[];
  /** Per-request facts the authenticator leaves for handlers (for example, an expired session). */
  locals: Record<string, unknown>;
}

export interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
  /** A non-JSON body (media, CSV); `headers` gives its content type. */
  raw?: Buffer | string;
}
