export interface FaultOptions {
  status?: number;
  body?: unknown;
  delayMs?: number;
  network?: boolean;
  hang?: boolean;
  times?: number;
  headers?: Record<string, string>;
}
