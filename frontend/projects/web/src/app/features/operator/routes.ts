import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/**
 * Operator console pages, each a child of the console frame. Add a page as
 * `{ path: 'queue', loadComponent: …, title: … }` (paths are relative to /admin).
 */
export const operatorPages: Routes = [
  { path: 'cuisines', loadComponent: () => import('./cuisines/cuisines.page').then((m) => m.CuisinesPage), title: $localize`:@@cuisines.documentTitle:Cuisines · Sweet Hand` },
  { path: 'breaches', loadComponent: () => import('./breaches/breaches.page').then((m) => m.BreachesPage), title: $localize`:@@breaches.documentTitle:Breach register · Sweet Hand` },
  { path: 'operators', loadComponent: () => import('./operators/operators.page').then((m) => m.OperatorsPage), title: $localize`:@@operators.documentTitle:Operators · Sweet Hand` },
  { path: 'audit', loadComponent: () => import('./audit/audit.page').then((m) => m.AuditPage), title: $localize`:@@audit.documentTitle:Audit log · Sweet Hand` },
  { path: 'reviews', loadComponent: () => import('./reviews/reviews.page').then((m) => m.ReviewsPage), title: $localize`:@@reviewsAdmin.documentTitle:Reviews · Sweet Hand` },
  { path: 'metrics', loadComponent: () => import('./metrics/metrics.page').then((m) => m.MetricsPage), title: $localize`:@@metrics.documentTitle:Metrics · Sweet Hand` },
];

/** Routes of the operator area; every page needs the role (L2-079). */
export const operatorRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [requireRole('Operator')],
    loadComponent: () => import('./layout/operator-layout').then((m) => m.OperatorLayout),
    data: { mainClass: 'container' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'queue' },
      ...operatorPages,
      { path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } },
    ],
  },
];
