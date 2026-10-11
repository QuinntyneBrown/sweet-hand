import type { Route } from '@angular/router';
import type { SystemPageKind } from './system-page-kind';

/** A system page ("Page not found", "No access", …) at `path`; `'**'` catches every unknown address below its parent. */
export function system(path: string, kind: SystemPageKind, title?: string): Route {
  return {
    path,
    loadComponent: () => import('./system-page').then((m) => m.SystemPage),
    data: { kind },
    ...(title === undefined ? {} : { title }),
  };
}
