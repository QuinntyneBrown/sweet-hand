import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request as ExpressRequest } from 'express';
import { ProblemError, forbidden, problem, unauthorized } from '../problems.ts';
import type { Actor, Policy, Reply, Request } from '../endpoint.ts';
import type { Environment } from '../../environment.ts';
import { RateLimiter } from '../../platform/rate-limit.ts';
import { hashIp } from '../../platform/secrets.ts';
import { BadJson, BodyTooLarge, MB, readBody } from './body.ts';
import { MAX_BODY, POLICY, REFUSAL, WITHOUT_DATABASE, requestContext } from './decorators.ts';
import { PIPELINE_OPTIONS, type PipelineOptions } from './options.ts';

/** Public reads allowed per address per minute (L2-082.1). */
const PUBLIC_READS_PER_MINUTE = 300;
const SAFE_METHODS = new Set(['GET', 'HEAD']);

/** The route matched: its parameters join the request context. */
function context(execution: ExecutionContext): Request {
  const ctx = requestContext(execution);
  ctx.params = { ...(execution.switchToHttp().getRequest() as ExpressRequest).params } as Record<string, string>;
  return ctx;
}

/** 300 public reads a minute per address; one limiter per environment, so test sessions never share counts (L2-082.1). */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiters = new WeakMap<Environment, RateLimiter>();

  canActivate(execution: ExecutionContext): boolean {
    const ctx = context(execution);
    if (ctx.method !== 'GET' || !(ctx.path.startsWith('/api/public/') || ctx.path.startsWith('/media/'))) return true;
    let limiter = this.limiters.get(ctx.env);
    if (!limiter) this.limiters.set(ctx.env, (limiter = new RateLimiter(PUBLIC_READS_PER_MINUTE)));
    const wait = limiter.take(ctx.ip, ctx.env.clock.now());
    if (wait === null) return true;
    console.log(JSON.stringify({ level: 'security', type: 'rate-limit-block', path: ctx.path, ipHash: hashIp(ctx.ip), at: ctx.env.clock.now().toISOString(), correlationId: ctx.correlationId }));
    throw new ProblemError({ ...problem(429, 'Too many requests'), headers: { 'retry-after': String(wait) } });
  }
}

/** State changes must echo the CSRF cookie and come from an allowed origin (L2-081.4). */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly options: PipelineOptions;

  constructor(@Inject(PIPELINE_OPTIONS) options: PipelineOptions) {
    this.options = options;
  }

  canActivate(execution: ExecutionContext): boolean {
    const ctx = context(execution);
    if (SAFE_METHODS.has(ctx.method)) return true;
    const { allowedOrigins } = this.options.config;
    const origin = ctx.headers.origin;
    const badOrigin = origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin);
    if (!ctx.cookies['XSRF-TOKEN'] || ctx.headers['x-xsrf-token'] !== ctx.cookies['XSRF-TOKEN'] || badOrigin) {
      throw new ProblemError(problem(403, 'Missing or invalid CSRF token'));
    }
    return true;
  }
}

/** Reads the JSON body within the route's limit: 1 MB unless it is an upload (L2-080.3, L2-080.4). */
@Injectable()
export class BodyGuard implements CanActivate {
  private readonly reflector: Reflector;

  constructor(reflector: Reflector) {
    this.reflector = reflector;
  }

  async canActivate(execution: ExecutionContext): Promise<boolean> {
    const ctx = context(execution);
    const limit = this.reflector.get<number | undefined>(MAX_BODY, execution.getHandler()) ?? MB;
    try {
      ctx.body = await readBody(execution.switchToHttp().getRequest(), limit);
    } catch (err) {
      if (err instanceof BodyTooLarge) throw new ProblemError(problem(413, 'The request is too large'));
      if (err instanceof BadJson) throw new ProblemError(problem(400, 'The request body is not valid JSON'));
      throw err;
    }
    return true;
  }
}

function permits(policy: Policy | undefined, actor: Actor | undefined): 200 | 401 | 403 {
  // Endpoints require a declared policy; anonymous access is always an explicit choice (AGENTS.md).
  if (!policy) return 403;
  if (policy.kind === 'anonymous') return 200;
  if (!actor) return 401;
  if (!policy.roles.includes(actor.role)) return 403;
  if (policy.admin && !actor.admin) return 403;
  return 200;
}

/**
 * Resolves the caller from the session and checks the endpoint policy
 * (authorise-requests design): 401 without a session, 403 for a role the
 * policy refuses, logged as a security event (L2-079.4).
 */
@Injectable()
export class EndpointPolicyGuard implements CanActivate {
  private readonly reflector: Reflector;
  private readonly options: PipelineOptions;

  constructor(reflector: Reflector, @Inject(PIPELINE_OPTIONS) options: PipelineOptions) {
    this.reflector = reflector;
    this.options = options;
  }

  async canActivate(execution: ExecutionContext): Promise<boolean> {
    const ctx = context(execution);
    const policy = this.reflector.get<Policy | undefined>(POLICY, execution.getHandler());
    const refusal = this.reflector.get<((req: Request) => Promise<Reply>) | undefined>(REFUSAL, execution.getHandler());
    if (policy?.kind === 'anonymous' && this.reflector.get<boolean>(WITHOUT_DATABASE, execution.getHandler())) return true;
    const denial = await ctx.env.db.transaction(async (tx): Promise<Reply | undefined> => {
      ctx.tx = tx;
      ctx.actor = await this.options.authenticate?.(ctx);
      const verdict = permits(policy, ctx.actor);
      if (verdict === 200) return undefined;
      await this.options.onDenied?.(ctx, verdict);
      if (verdict === 401) return unauthorized();
      const custom = await refusal?.(ctx);
      return custom ? { ...custom, status: 403 } : forbidden();
    });
    if (denial) throw new ProblemError(denial);
    return true;
  }
}
