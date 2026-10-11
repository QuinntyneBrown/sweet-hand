import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { from, lastValueFrom, type Observable } from 'rxjs';
import type { Reply } from '../router.ts';
import { WITHOUT_DATABASE, requestContext } from './decorators.ts';
import { prepareReply } from './reply.ts';

/**
 * Runs the handler in one database transaction: its writes commit together
 * when it returns a reply, and none do when it throws (ADR 0007). Then writes
 * the reply's status, headers and cookies.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly reflector: Reflector;

  constructor(reflector: Reflector) {
    this.reflector = reflector;
  }

  intercept(execution: ExecutionContext, next: CallHandler<Reply>): Observable<unknown> {
    const ctx = requestContext(execution);
    const res = execution.switchToHttp().getResponse<Response>();
    if (this.reflector.get<boolean>(WITHOUT_DATABASE, execution.getHandler())) {
      return from(lastValueFrom(next.handle()).then((reply) => prepareReply(res, ctx, reply)));
    }
    return from(
      ctx.env.db
        .transaction(async (tx) => {
          ctx.tx = tx;
          ctx.now = ctx.env.clock.now();
          return lastValueFrom(next.handle());
        })
        .then((reply) => prepareReply(res, ctx, reply)),
    );
  }
}
