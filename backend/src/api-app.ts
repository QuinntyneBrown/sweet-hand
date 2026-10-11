import type { INestApplication, Type } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createNestApp } from './http/nest/create-app.ts';
import type { Environments } from './http/nest/options.ts';
import type { Config } from './platform/config.ts';
import { productControllers, productHooks } from './product.ts';

export interface ApiAppOptions {
  environments: Environments;
  config?: Partial<Pick<Config, 'secureCookies' | 'allowedOrigins' | 'trustProxy'>>;
  /** Handled before any route: the test-control API in test mode (ADR 0008). */
  control?: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
  /** Overrides, for tests that add probe controllers. */
  controllers?: Type<unknown>[];
}

/** The Sweet Hand API (ADR 0009): product controllers and request hooks, shared by main.ts and the acceptance tests. */
export async function createApiApp(options: ApiAppOptions): Promise<INestApplication> {
  const control = options.control;
  return createNestApp({
    controllers: options.controllers ?? productControllers,
    environments: options.environments,
    config: { secureCookies: false, allowedOrigins: [], trustProxy: false, ...options.config },
    ...productHooks(),
    before: control
      ? (req, res, next) => {
          control(req, res).then((handled) => handled || next(), next);
        }
      : undefined,
  });
}
