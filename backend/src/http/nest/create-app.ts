import 'reflect-metadata';
import { Module, type DynamicModule, type INestApplication, type MiddlewareConsumer, type NestModule, type Type } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { Request as ExpressRequest, Response } from 'express';
import { BodyGuard, CsrfGuard, EndpointPolicyGuard, RateLimitGuard } from './guards.ts';
import { ProblemFilter } from './problem.filter.ts';
import { RequestContextMiddleware } from './request-context.middleware.ts';
import { TransactionInterceptor } from './transaction.interceptor.ts';
import { PIPELINE_OPTIONS, type PipelineOptions } from './options.ts';

export interface NestAppOptions extends PipelineOptions {
  controllers: Type<unknown>[];
  /** Express middleware tried before the app's routes (the test-control API, ADR 0009). */
  before?: (req: ExpressRequest, res: Response, next: () => void) => void;
}

@Module({})
class ApiModule implements NestModule {
  static register(options: NestAppOptions): DynamicModule {
    return { module: ApiModule, controllers: options.controllers, providers: [{ provide: PIPELINE_OPTIONS, useValue: options }] };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}

/**
 * The API as a NestJS application (ADR 0010), not yet listening. The request
 * pipeline: context middleware, then the rate-limit, CSRF, body and endpoint
 * policy guards in that order, then the handler in one transaction.
 */
export async function createNestApp(options: NestAppOptions): Promise<INestApplication> {
  const app = await NestFactory.create(ApiModule.register(options), { bodyParser: false, logger: ['error', 'warn'] });
  if (options.before) app.use(options.before);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RateLimitGuard(), new CsrfGuard(options), new BodyGuard(reflector), new EndpointPolicyGuard(reflector, options));
  app.useGlobalInterceptors(new TransactionInterceptor(reflector));
  app.useGlobalFilters(new ProblemFilter());
  const server = app.getHttpAdapter().getInstance();
  server.disable('x-powered-by');
  server.set('etag', false);
  return app;
}
