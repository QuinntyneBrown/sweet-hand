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
