import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/** Routes of the enquiries area; every page needs the role (L2-079). */
export const enquiriesRoutes: Routes = [
  {
    path: 'inbox',
    canActivate: [requireRole('Customer')],
    loadComponent: () => import('./inbox/inbox.page').then((m) => m.InboxPage),
    data: { mainClass: 'container' },
    title: $localize`:@@inbox.documentTitle:Inbox · Sweet Hand`,
  },
  {
    path: 'inbox/:id',
    canActivate: [requireRole('Customer')],
    loadComponent: () => import('./thread/thread.page').then((m) => m.ThreadPage),
    data: { mainClass: 'container' },
    title: $localize`:@@thread.documentTitle:Enquiry · Sweet Hand`,
  },
];
