import type { Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';
import { system } from '../../shell/system-route';

/**
 * Operator console pages, each a child of the console frame. Add a page as
 * `{ path: 'queue', loadComponent: …, title: … }` (paths are relative to /admin).
 */
export const operatorPages: Routes = [
  { path: 'cuisines', loadComponent: () => import('./cuisines/cuisines.page').then((m) => m.CuisinesPage), title: $localize`:@@operatorCuisines.documentTitle:Cuisines` },
  { path: 'breaches', loadComponent: () => import('./breaches/breaches.page').then((m) => m.BreachesPage), title: $localize`:@@breaches.documentTitle:Breach register` },
  { path: 'operators', loadComponent: () => import('./operators/operators.page').then((m) => m.OperatorsPage), title: $localize`:@@operators.documentTitle:Operators` },
  { path: 'audit', loadComponent: () => import('./audit/audit.page').then((m) => m.AuditPage), title: $localize`:@@audit.documentTitle:Audit log` },
  { path: 'reviews', loadComponent: () => import('./reviews/reviews.page').then((m) => m.ReviewsPage), title: $localize`:@@reviewsAdmin.documentTitle:Reviews` },
  { path: 'metrics', loadComponent: () => import('./metrics/metrics.page').then((m) => m.MetricsPage), title: $localize`:@@metrics.documentTitle:Metrics` },
  // Moderation (docs/detailed-designs/moderation).
  {
    path: 'queue',
    loadComponent: () => import('./moderation/queue/queue.page').then((m) => m.ReviewQueuePage),
    title: $localize`:@@queue.title:Review queue`,
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./moderation/profile-review/profile-review.page').then((m) => m.ProfileReviewPage),
    title: $localize`:@@review.title:Profile review`,
  },
  {
    path: 'caterers',
    loadComponent: () => import('./moderation/caterers/caterers.page').then((m) => m.OperatorCaterersPage),
    title: $localize`:@@caterers.title:Caterers`,
  },
  {
    path: 'caterers/:id',
    loadComponent: () => import('./moderation/caterer-record/caterer-record.page').then((m) => m.CatererRecordPage),
    title: $localize`:@@record.title:Caterer record`,
  },
  {
    path: 'changes',
    loadComponent: () => import('./moderation/changes/changes.page').then((m) => m.RecentChangesPage),
    title: $localize`:@@changes.title:Recent changes`,
  },
  {
    path: 'reports/:id',
    loadComponent: () => import('./moderation/reports/report.page').then((m) => m.ReportPage),
    title: $localize`:@@reportPage.title:Report`,
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
      system('**', 'not-found'),
    ],
  },
];
