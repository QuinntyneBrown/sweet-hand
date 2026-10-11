import type { Routes } from '@angular/router';
import { page } from '../../core/routing/page';
import { requireRole } from '../../core/session/guards';
import { system } from '../../shell/system-route';

/** Routes of the account area; every page needs an account (L2-079). */
export const accountRoutes: Routes = [
  {
    path: 'account',
    canActivate: [requireRole('Customer', 'Caterer', 'Operator')],
    children: [
      page('', () => import('./account.page').then((m) => m.AccountPage), $localize`:@@account.documentTitle:Account`, { pathMatch: 'full' }),
      system('**', 'not-found'),
    ],
  },
];
