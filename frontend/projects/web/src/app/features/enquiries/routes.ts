import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/** Routes of the enquiries area; every page needs the role (L2-079). Pages are added as they are built. */
export const enquiriesRoutes: Routes = [
  {
    path: 'inbox',
    canActivate: [requireRole('Customer')],
    children: [{ path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } }],
  },
];
