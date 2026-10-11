import type { INestApplication, Type } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createNestApp } from './http/nest/create-app.ts';
import type { Environments } from './http/nest/options.ts';
import type { Config } from './platform/config.ts';
import { productControllers, productHooks } from './product.ts';
import { prelaunchGate } from './http/prelaunch-gate.ts';

export interface ApiAppOptions {
  environments: Environments;
  config?: Partial<Pick<Config, 'secureCookies' | 'allowedOrigins' | 'trustProxy' | 'prelaunchMode'>>;
  /** Handled before any route: the test-control API in test mode (ADR 0009). */
  control?: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
  /** Overrides, for tests that add probe controllers. */
  controllers?: Type<unknown>[];
}

/** The Sweet Hand API (ADR 0010): product controllers and request hooks, shared by main.ts and the acceptance tests. */
export async function createApiApp(options: ApiAppOptions): Promise<INestApplication> {
  const control = options.control;
  return createNestApp({
    controllers: options.controllers ?? productControllers,
    environments: options.environments,
    config: { secureCookies: false, allowedOrigins: [], trustProxy: false, prelaunchMode: false, ...options.config },
    ...productHooks(),
    before: (req, res, next) => {
      if (options.config?.prelaunchMode && prelaunchGate(req, res)) return;
      if (control) control(req, res).then((handled) => handled || next(), next);
      else next();
    },
  });
}
