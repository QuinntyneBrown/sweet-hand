import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/** Routes of the account area; every page needs the role (L2-079). Pages are added as they are built. */
export const accountRoutes: Routes = [
  {
    path: 'account',
    canActivate: [requireRole('Customer','Caterer','Operator')],
    children: [{ path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } }],
  },
];
