import type { Routes } from '@angular/router';
import { discoveryRoutes } from './features/discovery/routes';

const system = (path: string, kind: string, title: string): Routes[number] => ({
  path,
  loadComponent: () => import('./shell/system-page').then((m) => m.SystemPage),
  data: { kind },
  title,
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'caterers' },
  ...discoveryRoutes,
  system('403', 'forbidden', $localize`:@@system.forbidden.title:No access · Sweet Hand`),
  system('500', 'server-error', $localize`:@@system.serverError.title:Something went wrong · Sweet Hand`),
  system('429', 'rate-limited', $localize`:@@system.rateLimited.title:Slow down · Sweet Hand`),
  system('offline', 'offline', $localize`:@@system.offline.title:Offline · Sweet Hand`),
  system('maintenance', 'maintenance', $localize`:@@system.maintenance.title:Back soon · Sweet Hand`),
  system('404', 'not-found', $localize`:@@system.notFound.title:Page not found · Sweet Hand`),
  system('**', 'not-found', $localize`:@@system.notFound.title:Page not found · Sweet Hand`),
];
