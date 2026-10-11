import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Policy, Reply, Request } from '../router.ts';

export const POLICY = 'sweet-hand:policy';
export const MAX_BODY = 'sweet-hand:max-body';
export const REFUSAL = 'sweet-hand:refusal';
export const WITHOUT_DATABASE = 'sweet-hand:without-database';

/** Who may call the endpoint (authorise-requests design). A route without one is refused. */
export const UsePolicy = (policy: Policy) => SetMetadata(POLICY, policy);

/** Upload endpoints accept bodies larger than the 1 MB default (L2-080.3). */
export const MaxBody = (bytes: number) => SetMetadata(MAX_BODY, bytes);

/** The 403 reply for a signed-in caller the policy refuses, in place of the generic one (L2-056.5). */
export const Refusal = (refusal: (req: Request) => Promise<Reply>) => SetMetadata(REFUSAL, refusal);

/**
 * The handler needs no transaction and no caller (health checks): it must
 * answer even when the database cannot be reached (L2-088.3). Anonymous only.
 */
export const WithoutDatabase = () => SetMetadata(WITHOUT_DATABASE, true);

/** The request context use cases take: parsed request, environment, transaction, caller. */
export const Ctx = createParamDecorator((_data: unknown, context: ExecutionContext): Request => requestContext(context));

/** The request context the middleware attached to the Express request. */
export function requestContext(context: ExecutionContext): Request {
  return (context.switchToHttp().getRequest() as { sweetHand: Request }).sweetHand;
}
