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
  // Listed before the dashboard area in app.routes.ts, so these win over 'dashboard'.
  {
    path: 'dashboard/enquiries',
    canActivate: [requireRole('Caterer')],
    loadComponent: () => import('./caterer/enquiries.page').then((m) => m.EnquiriesPage),
    data: { mainClass: 'container' },
    title: $localize`:@@enquiries.documentTitle:Enquiries · Sweet Hand`,
  },
  {
    path: 'dashboard/enquiries/:id',
    canActivate: [requireRole('Caterer')],
    loadComponent: () => import('./caterer/enquiry.page').then((m) => m.EnquiryPage),
    data: { mainClass: 'container' },
    title: $localize`:@@thread.documentTitle:Enquiry · Sweet Hand`,
  },
];
