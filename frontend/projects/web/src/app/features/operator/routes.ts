import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/** Routes of the operator area; every page needs the role (L2-079). Pages are added as they are built. */
export const operatorRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [requireRole('Operator')],
    children: [{ path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } }],
  },
];
