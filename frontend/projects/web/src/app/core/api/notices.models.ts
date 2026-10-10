/** Wire types for site-wide notices (ADR 0003). Shared with the fake backend; keep import-free. */

/** Something everyone should know about Sweet Hand itself (L2-088, L2-091). */
export type SiteNotice =
  | { id: string; kind: 'maintenance'; startsAt: string; endsAt: string }
  /** A dependency is struggling: messages may be slow, nothing is lost. */
  | { id: string; kind: 'degraded' };
