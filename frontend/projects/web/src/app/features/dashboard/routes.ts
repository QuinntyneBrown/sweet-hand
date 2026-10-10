import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/**
 * Routes of the dashboard area; every page needs the role (L2-079).
 * `/dashboard/enquiries*` belongs to the enquiries area and is matched first (app.routes.ts).
 */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [requireRole('Caterer')],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview.page').then((m) => m.OverviewPage),
        data: { mainClass: 'container' },
        title: $localize`:@@dashboard.documentTitle:Dashboard · Sweet Hand`,
      },
      { path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } },
    ],
  },
];
