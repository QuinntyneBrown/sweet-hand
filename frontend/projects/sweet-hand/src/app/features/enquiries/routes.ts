import type { Routes } from '@angular/router';
import { page } from '../../core/routing/page';
import { requireRole } from '../../core/session/guards';

const customer = { canActivate: [requireRole('Customer')] };
const caterer = { canActivate: [requireRole('Caterer')] };

/** Routes of the enquiries area; every page needs the role (L2-079). */
export const enquiriesRoutes: Routes = [
  page('inbox', () => import('./inbox/inbox.page').then((m) => m.InboxPage), $localize`:@@inbox.documentTitle:Inbox`, customer),
  page('inbox/:id', () => import('./thread/thread.page').then((m) => m.ThreadPage), $localize`:@@thread.documentTitle:Enquiry`, customer),
  // Listed before the dashboard area in app.routes.ts, so these win over 'dashboard'.
  page('dashboard/enquiries', () => import('./caterer/enquiries.page').then((m) => m.EnquiriesPage), $localize`:@@enquiries.documentTitle:Enquiries`, caterer),
  page('dashboard/enquiries/:id', () => import('./caterer/enquiry.page').then((m) => m.EnquiryPage), $localize`:@@thread.documentTitle:Enquiry`, caterer),
];
