import type { Handler } from './handler.ts';

export interface Route<S> {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler<S>;
}
