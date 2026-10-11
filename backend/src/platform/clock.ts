export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

/** Saturday 10 October 2026, 10:00 a.m. in Toronto: "today" in the mocks' cast and the test suites. */
export const CAST_NOW = '2026-10-10T14:00:00.000Z';

/** A clock that stands still until it is moved, for tests and the test-control API. */
export class FixedClock implements Clock {
  private current: Date;

  constructor(iso: string = CAST_NOW) {
    this.current = new Date(iso);
  }

  now(): Date {
    return new Date(this.current);
  }

  set(iso: string): void {
    this.current = new Date(iso);
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}
