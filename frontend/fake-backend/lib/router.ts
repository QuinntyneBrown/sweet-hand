import type { Handler } from './http.ts';

interface Route<S> {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler<S>;
}

/** A tiny method + path router. Patterns use `:name` segments, e.g. `/api/public/caterers/:slug`. */
export class Router<S> {
  private readonly routes: Route<S>[] = [];

  on(method: string, path: string, handler: Handler<S>): this {
    const keys: string[] = [];
    const source = path.replace(/:([A-Za-z]+)/g, (_m, key: string) => {
      keys.push(key);
      return '([^/]+)';
    });
    this.routes.push({ method, pattern: new RegExp(`^${source}$`), keys, handler });
    return this;
  }

  get(path: string, h: Handler<S>) { return this.on('GET', path, h); }
  post(path: string, h: Handler<S>) { return this.on('POST', path, h); }
  put(path: string, h: Handler<S>) { return this.on('PUT', path, h); }
  patch(path: string, h: Handler<S>) { return this.on('PATCH', path, h); }
  delete(path: string, h: Handler<S>) { return this.on('DELETE', path, h); }

  match(method: string, path: string): { handler: Handler<S>; params: Record<string, string> } | undefined {
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const m = r.pattern.exec(path);
      if (!m) continue;
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { handler: r.handler, params };
    }
    return undefined;
  }
}
