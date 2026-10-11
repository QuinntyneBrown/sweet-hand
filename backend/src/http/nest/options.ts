import type { Actor, Request } from '../router.ts';
import type { Config } from '../../platform/config.ts';
import type { Environment } from '../../environment.ts';
import type { IncomingMessage } from 'node:http';

export interface Environments {
  resolve(req: IncomingMessage): Environment | Promise<Environment>;
}

/** Resolves the signed-in caller from the request (identity area); may set cookies. */
export type Authenticator = (req: Request) => Promise<Actor | undefined>;

/** Called when a caller is refused by an endpoint policy (security log, L2-079.4). */
export type DenialRecorder = (req: Request, status: 401 | 403) => Promise<void>;

/** Everything the request pipeline needs, provided once when the app is created. */
export interface PipelineOptions {
  environments: Environments;
  config: Pick<Config, 'secureCookies' | 'allowedOrigins' | 'trustProxy'>;
  authenticate?: Authenticator;
  onDenied?: DenialRecorder;
}

export const PIPELINE_OPTIONS = Symbol('PIPELINE_OPTIONS');
