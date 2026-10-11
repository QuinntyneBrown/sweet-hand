export interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string | string[]>;
  raw?: Buffer | string;
}
