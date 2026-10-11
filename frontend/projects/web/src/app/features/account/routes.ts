import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/** Routes of the account area; every page needs an account (L2-079). */
export const accountRoutes: Routes = [
  {
    path: 'account',
    canActivate: [requireRole('Customer', 'Caterer', 'Operator')],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./account.page').then((m) => m.AccountPage),
        data: { mainClass: 'container' },
        title: $localize`:@@account.documentTitle:Account · Sweet Hand`,
      },
      { path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } },
    ],
  },
];
