import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { from, lastValueFrom, type Observable } from 'rxjs';
import type { Reply } from '../router.ts';
import { requestContext } from './decorators.ts';
import { prepareReply } from './reply.ts';

/**
 * Runs the handler in one database transaction: its writes commit together
 * when it returns a reply, and none do when it throws (ADR 0007). Then writes
 * the reply's status, headers and cookies.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  intercept(execution: ExecutionContext, next: CallHandler<Reply>): Observable<unknown> {
    const ctx = requestContext(execution);
    const res = execution.switchToHttp().getResponse<Response>();
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
