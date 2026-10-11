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

export type Handler = (req: Request) => Promise<Reply>;

export interface RouteOptions {
  /** Upload endpoints accept bodies larger than the 1 MB default (L2-080.3). */
  maxBodyBytes?: number;
  /**
   * The 403 reply for a signed-in caller the policy refuses, in place of the
   * generic one (for example, naming the Admins to ask, L2-056.5). The
   * refusal is still logged as a security event.
   */
  refusal?: (req: Request) => Promise<Reply>;
}

export interface Route {
  method: string;
  path: string;
  policy: Policy;
  handler: Handler;
  options: RouteOptions;
  pattern: RegExp;
  keys: string[];
}

/** Method + path router. Patterns use `:name` segments, e.g. `/api/public/caterers/:slug`. */
export class Router {
  readonly routes: Route[] = [];

  on(method: string, path: string, policy: Policy, handler: Handler, options: RouteOptions = {}): this {
    if (!policy) throw new Error(`${method} ${path} has no endpoint policy`);
    const keys: string[] = [];
    const source = path.replace(/:([A-Za-z]+)/g, (_m, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
    this.routes.push({ method, path, policy, handler, options, pattern: new RegExp(`^${source}$`), keys });
    return this;
  }

  get(path: string, policy: Policy, h: Handler, o?: RouteOptions) {
    return this.on('GET', path, policy, h, o);
  }
  post(path: string, policy: Policy, h: Handler, o?: RouteOptions) {
    return this.on('POST', path, policy, h, o);
  }
  put(path: string, policy: Policy, h: Handler, o?: RouteOptions) {
    return this.on('PUT', path, policy, h, o);
  }
  patch(path: string, policy: Policy, h: Handler, o?: RouteOptions) {
    return this.on('PATCH', path, policy, h, o);
  }
  delete(path: string, policy: Policy, h: Handler, o?: RouteOptions) {
    return this.on('DELETE', path, policy, h, o);
  }

  match(method: string, path: string): { route: Route; params: Record<string, string> } | undefined {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const m = route.pattern.exec(path);
      if (!m) continue;
      const params: Record<string, string> = {};
      try {
        route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      } catch {
        return undefined;
      }
      return { route, params };
    }
    return undefined;
  }
}

/** A feature area registers its routes. */
export type Area = (r: Router) => void;
