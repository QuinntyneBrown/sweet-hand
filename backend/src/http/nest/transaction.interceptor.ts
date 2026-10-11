import { Inject, Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { from, lastValueFrom, type Observable } from 'rxjs';
import type { Reply, Request } from '../endpoint.ts';
import { ProblemError } from '../problems.ts';
import { PIPELINE_OPTIONS, type PipelineOptions } from './options.ts';
import { WITHOUT_DATABASE, requestContext } from './decorators.ts';
import { prepareReply } from './reply.ts';

/**
 * Runs the handler in one database transaction: its writes commit together
 * when it returns a reply, and none do when it throws (ADR 0008). Then writes
 * the reply's status, headers and cookies.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly reflector: Reflector;
  private readonly options: PipelineOptions;

  constructor(reflector: Reflector, @Inject(PIPELINE_OPTIONS) options: PipelineOptions) {
    this.reflector = reflector;
    this.options = options;
  }

  /** Records a refusal the handler decided, after its own transaction has committed or rolled back. */
  private async recordDenial(ctx: Request, reply: Reply): Promise<void> {
    if (!reply.denied || !this.options.onDenied) return;
    await ctx.env.db.transaction(async (tx) => {
      ctx.tx = tx;
      await this.options.onDenied!(ctx, reply.status, reply.denied!.targetId);
    });
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
        .then(
          async (reply) => {
            await this.recordDenial(ctx, reply);
            return prepareReply(res, ctx, reply);
          },
          async (error: unknown) => {
            if (error instanceof ProblemError) await this.recordDenial(ctx, error.reply);
            throw error;
          },
        ),
    );
  }
}
