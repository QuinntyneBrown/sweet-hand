import type { Reply } from './endpoint.ts';

/** RFC 9457 problem replies (ADR 0003). Field names in `errors` match the form control names. */
export const ok = (body: unknown, status = 200): Reply => ({ status, body });
export const created = (body: unknown): Reply => ({ status: 201, body });
export const accepted = (body: unknown = {}): Reply => ({ status: 202, body });
export const noContent = (): Reply => ({ status: 204 });
export const problem = (status: number, title: string, extra: Record<string, unknown> = {}): Reply => ({ status, body: { title, ...extra } });
export const badRequest = (title: string, extra: Record<string, unknown> = {}) => problem(400, title, extra);
export const unauthorized = () => problem(401, 'Sign in to continue');
export const forbidden = () => problem(403, 'Forbidden');
export const notFound = () => problem(404, 'Not found');
export const conflict = (title: string, extra: Record<string, unknown> = {}) => problem(409, title, extra);
export const gone = (title: string) => problem(410, title);
export const invalid = (errors: Record<string, string[]>, status = 400, title = 'Check the form'): Reply => ({ status, body: { title, errors } });

/** Thrown by use cases to end the request with a problem reply; the transaction rolls back. */
export class ProblemError extends Error {
  readonly reply: Reply;

  constructor(reply: Reply) {
    super(String((reply.body as { title?: string } | undefined)?.title ?? reply.status));
    this.reply = reply;
  }
}

export const fail = (reply: Reply): never => {
  throw new ProblemError(reply);
};
