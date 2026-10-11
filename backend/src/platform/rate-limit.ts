/**
 * Fixed one-minute windows per client address for public reads (L2-082.1).
 * Counts live in the process: each instance enforces the limit on its own
 * traffic, which the load balancer spreads evenly.
 */
export class RateLimiter {
  private readonly windows = new Map<string, { start: number; count: number }>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs = 60_000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Counts a request; returns the seconds to wait when it is over the limit. */
  take(key: string, now: Date): number | null {
    const start = Math.floor(now.getTime() / this.windowMs) * this.windowMs;
    let window = this.windows.get(key);
    if (!window || window.start !== start) {
      if (this.windows.size > 100_000) this.windows.clear();
      window = { start, count: 0 };
      this.windows.set(key, window);
    }
    window.count++;
    return window.count > this.limit ? Math.ceil((start + this.windowMs - now.getTime()) / 1000) : null;
  }
}
