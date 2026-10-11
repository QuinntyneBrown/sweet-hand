import type { Ctx } from './http.ts';
import type { Reply } from './reply.ts';

export type Handler<S> = (ctx: Ctx<S>) => Reply | Promise<Reply>;
