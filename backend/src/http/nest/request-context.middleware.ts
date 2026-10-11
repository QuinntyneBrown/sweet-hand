import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request as ExpressRequest, Response, NextFunction } from 'express';
import { parseCookies, serializeCookie } from '../cookies.ts';
import type { Request } from '../router.ts';
import type { Transaction } from '../../platform/database.ts';
import { applyStandardHeaders } from './reply.ts';
import { PIPELINE_OPTIONS, type PipelineOptions } from './options.ts';

/** Stands in for the transaction until the handler's transaction opens. */
const noTransaction = new Proxy({} as Transaction, {
  get() {
    throw new Error('No transaction is open for this request');
  },
});

/**
 * Builds the request context use cases take: environment (one per test session
 * in test mode), correlation ID, cookies, the CSRF cookie, client address; and
 * sets the headers every response carries.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly options: PipelineOptions;

  constructor(@Inject(PIPELINE_OPTIONS) options: PipelineOptions) {
    this.options = options;
  }

  async use(req: ExpressRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { config } = this.options;
      const upstream = config.trustProxy ? String(req.headers['x-correlation-id'] ?? '') : '';
      const correlationId = /^[\w-]{8,64}$/.test(upstream) ? upstream : randomUUID();
      const cookies = parseCookies(req.headers.cookie);
      const cookiesOut: string[] = [];
      // Every response carries the CSRF token cookie; Angular echoes it as X-XSRF-TOKEN (ADR 0003).
      if (!cookies['XSRF-TOKEN']) cookiesOut.push(serializeCookie('XSRF-TOKEN', randomUUID(), { secure: config.secureCookies }));
      const forwarded = config.trustProxy ? String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
      const env = await this.options.environments.resolve(req);
      const url = new URL(req.originalUrl ?? req.url ?? '/', 'http://localhost');
      const ctx: Request = {
        method: req.method,
        path: url.pathname,
        params: {},
        query: url.searchParams,
        body: undefined,
        headers: req.headers,
        cookies,
        ip: forwarded || req.socket.remoteAddress || 'unknown',
        correlationId,
        env,
        tx: noTransaction,
        now: env.clock.now(),
        cookiesOut,
        locals: {},
      };
      (req as unknown as { sweetHand: Request }).sweetHand = ctx;
      applyStandardHeaders(res, correlationId, config.secureCookies);
      next();
    } catch (err) {
      next(err);
    }
  }
}
