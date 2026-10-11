import { Catch, NotFoundException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { ProblemError, notFound, problem } from '../problems.ts';
import type { Request } from '../router.ts';
import { sendReply } from './reply.ts';

/** Problems become their reply; an unknown route is 404; anything else is a generic 500 with the correlation ID (L2-089.4). */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  private readonly fallback?: (req: ExpressRequest, res: Response) => void;

  /** `fallback` serves routes the Nest app does not know yet (the legacy router, while areas move). */
  constructor(fallback?: (req: ExpressRequest, res: Response) => void) {
    this.fallback = fallback;
  }

  catch(error: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<ExpressRequest & { sweetHand?: Request }>();
    const res = http.getResponse<Response>();
    const ctx = req.sweetHand;
    if (error instanceof ProblemError) return sendReply(res, ctx, error.reply);
    if (error instanceof NotFoundException) {
      if (this.fallback) return this.fallback(req, res);
      return sendReply(res, ctx, notFound());
    }
    const correlationId = ctx?.correlationId ?? 'unknown';
    console.error(JSON.stringify({ level: 'error', correlationId, message: (error as Error)?.message, stack: (error as Error)?.stack }));
    if (res.headersSent) return void res.end();
    sendReply(res, ctx, problem(500, 'Something went wrong', { correlationId }));
  }
}
