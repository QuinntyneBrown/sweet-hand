import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';

/**
 * Operator console pages, each a child of the console frame. Add a page as
 * `{ path: 'queue', loadComponent: …, title: … }` (paths are relative to /admin).
 */
export const operatorPages: Routes = [
  // Moderation (docs/detailed-designs/moderation).
  {
    path: 'queue',
    loadComponent: () => import('./moderation/queue/queue.page').then((m) => m.ReviewQueuePage),
    title: $localize`:@@queue.title:Review queue · Sweet Hand`,
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./moderation/profile-review/profile-review.page').then((m) => m.ProfileReviewPage),
    title: $localize`:@@review.title:Profile review · Sweet Hand`,
  },
  {
    path: 'caterers',
    loadComponent: () => import('./moderation/caterers/caterers.page').then((m) => m.OperatorCaterersPage),
    title: $localize`:@@caterers.title:Caterers · Sweet Hand`,
  },
  {
    path: 'caterers/:id',
    loadComponent: () => import('./moderation/caterer-record/caterer-record.page').then((m) => m.CatererRecordPage),
    title: $localize`:@@record.title:Caterer record · Sweet Hand`,
  },
  {
    path: 'changes',
    loadComponent: () => import('./moderation/changes/changes.page').then((m) => m.RecentChangesPage),
    title: $localize`:@@changes.title:Recent changes · Sweet Hand`,
  },
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
