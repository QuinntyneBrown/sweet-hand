import type { INestApplication, Type } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from './app.ts';
import type { Area } from './http/router.ts';
import { createNestApp } from './http/nest/create-app.ts';
import type { Environments } from './http/nest/options.ts';
import type { Config } from './platform/config.ts';
import { productControllers, productOptions } from './product.ts';

export interface ApiAppOptions {
  environments: Environments;
  config?: Partial<Pick<Config, 'secureCookies' | 'allowedOrigins' | 'trustProxy'>>;
  /** Handled before any route: the test-control API in test mode (ADR 0008). */
  control?: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
  /** Overrides, for tests that add probe routes. */
  controllers?: Type<unknown>[];
  areas?: Area[];
}

/** The Sweet Hand API (ADR 0009): product controllers and request hooks, shared by main.ts and the acceptance tests. */
export async function createApiApp(options: ApiAppOptions): Promise<INestApplication> {
  const config = { secureCookies: false, allowedOrigins: [], trustProxy: false, ...options.config };
  const product = productOptions();
  // Routes not moved to a controller yet are served by the previous router (ADR 0009).
  const legacy = createApp({ ...product, areas: options.areas ?? product.areas, environments: options.environments, config });
  const control = options.control;
  return createNestApp({
    controllers: options.controllers ?? productControllers,
    environments: options.environments,
    config,
    authenticate: product.authenticate,
    onDenied: product.onDenied,
    fallback: (req, res) => legacy(req, res),
    before: control
      ? (req, res, next) => {
          control(req, res).then((handled) => handled || next(), next);
        }
      : undefined,
  });
}
