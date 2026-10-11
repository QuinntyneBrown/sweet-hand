import { HttpErrorResponse } from '@angular/common/http';

/** An RFC 9457 problem body from the API (ADR 0003). */
export interface Problem {
  title?: string;
  errors?: Record<string, string[]>;
  correlationId?: string;
  [key: string]: unknown;
}

export function problemOf(error: unknown): { status: number; problem: Problem } {
  if (error instanceof HttpErrorResponse) {
    const body = typeof error.error === 'object' && error.error ? (error.error as Problem) : {};
    return { status: error.status, problem: body };
  }
  return { status: 0, problem: {} };
}

/** The short reference shown to people when something fails on our side (L2-089.4). */
export function reference(problem: Problem): string | null {
  return typeof problem.correlationId === 'string' ? problem.correlationId : null;
}

/** Whether the server rejected named fields (ADR 0003): a 400 whose body says which. */
export function hasFieldErrors(problem: Problem): boolean {
  return !!problem.errors;
}

/** The server's first message for `field`, or null. Give several names when the API may use any of them. */
export function fieldError(problem: Problem, field: string | readonly string[]): string | null {
  for (const name of typeof field === 'string' ? [field] : field) {
    const message = problem.errors?.[name]?.[0];
    if (message) return message;
  }
  return null;
}

/**
 * The server's first message for each of the form's `fields`, or null. `wire`
 * names the fields the API spells differently from the form.
 */
export function fieldErrors<F extends string>(problem: Problem, fields: readonly F[], wire: Partial<Record<F, string | readonly string[]>> = {}): Record<F, string | null> {
  return Object.fromEntries(fields.map((f) => [f, fieldError(problem, wire[f] ?? f)])) as Record<F, string | null>;
}

/**
 * For a `FormDialogState.submit` handler: when the server rejected fields,
 * shows its messages for `fields` through `state.reject`. True when it did.
 */
export function applyProblem<F extends string>(
  state: { reject(errors: Record<F, string | null>): true },
  status: number,
  problem: Problem,
  fields: readonly F[],
  wire?: Partial<Record<F, string | readonly string[]>>,
): boolean {
  return status === 400 && hasFieldErrors(problem) && state.reject(fieldErrors(problem, fields, wire));
}
