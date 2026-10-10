/**
 * Faults a test arranges through the control API: fail, delay or drop the next
 * requests that match a method and path. Matching is on the path prefix or a
 * `*` glob, so `GET /api/public/caterers*` matches every listing request.
 */
export interface Fault {
  method: string;
  path: string;
  status?: number;
  body?: unknown;
  delayMs?: number;
  /** Destroy the socket instead of answering, as when the connection drops. */
  network?: boolean;
  /** Hang until released (loading states). */
  hang?: boolean;
  /** How many requests the fault applies to; omit for every request. */
  times?: number;
  headers?: Record<string, string>;
}

export function matches(fault: Fault, method: string, path: string): boolean {
  if (fault.method !== '*' && fault.method !== method) return false;
  const pattern = new RegExp(
    '^' + fault.path.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$',
  );
  return pattern.test(path);
}

/** Requests parked by a `hang` fault, per session, released by POST /__fake/release. */
export const hanging = new Map<string, (() => void)[]>();
