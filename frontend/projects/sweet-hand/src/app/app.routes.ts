import type { Routes } from '@angular/router';
import { accountRoutes } from './features/account/routes';
import { dashboardRoutes } from './features/dashboard/routes';
import { discoveryRoutes } from './features/discovery/routes';
import { enquiriesRoutes } from './features/enquiries/routes';
import { identityRoutes } from './features/identity/routes';
import { operatorRoutes } from './features/operator/routes';
import { reviewsRoutes } from './features/reviews/routes';
import { system } from './shell/system-route';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'caterers' },
  // Order matters: more specific paths in one area ('dashboard/enquiries', 'privacy/accept')
  // must come before broader ones in another ('dashboard', 'privacy').
  ...identityRoutes,
  ...enquiriesRoutes,
  ...accountRoutes,
  ...dashboardRoutes,
  ...operatorRoutes,
  ...reviewsRoutes,
  ...discoveryRoutes,
  system('403', 'forbidden', $localize`:@@system.forbidden.title:No access`),
  system('500', 'server-error', $localize`:@@system.serverError.title:Something went wrong`),
  system('429', 'rate-limited', $localize`:@@system.rateLimited.title:Slow down`),
  system('offline', 'offline', $localize`:@@system.offline.title:Offline`),
  system('maintenance', 'maintenance', $localize`:@@system.maintenance.title:Back soon`),
  system('404', 'not-found', $localize`:@@system.notFound.title:Page not found`),
  system('**', 'not-found', $localize`:@@system.notFound.title:Page not found`),
];
