import { inject } from '@angular/core';
import { Router, type CanActivateFn, type Routes } from '@angular/router';
import { requireRole } from '../../core/session/guards';
import { Session } from '../../core/session/session';

/** A removed caterer cannot edit their profile; the overview explains why (L2-058.5). */
const editorOpen: CanActivateFn = () =>
  inject(Session).user()?.caterer?.status === 'Removed' ? inject(Router).createUrlTree(['/dashboard']) : true;

/**
 * Routes of the dashboard area; every page needs the role (L2-079).
 * `/dashboard/enquiries*` belongs to the enquiries area and is matched first (app.routes.ts).
 */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [requireRole('Caterer')],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./overview/overview.page').then((m) => m.OverviewPage),
        data: { mainClass: 'container' },
        title: $localize`:@@dashboard.documentTitle:Dashboard · Sweet Hand`,
      },
      {
        path: 'profile/details',
        canActivate: [editorOpen],
        loadComponent: () => import('./details/details.page').then((m) => m.DetailsPage),
        data: { mainClass: 'container' },
        title: $localize`:@@details.documentTitle:Business details · Sweet Hand`,
      },
      {
        path: 'profile/cuisines',
        canActivate: [editorOpen],
        loadComponent: () => import('./cuisines/cuisines.page').then((m) => m.CuisinesPage),
        data: { mainClass: 'container' },
        title: $localize`:@@cuisines.documentTitle:Cuisines and areas · Sweet Hand`,
      },
      {
        path: 'profile/events',
        canActivate: [editorOpen],
        loadComponent: () => import('./events/events.page').then((m) => m.EventsPage),
        data: { mainClass: 'container' },
        title: $localize`:@@events.documentTitle:Guests and occasions · Sweet Hand`,
      },
      {
        path: 'profile/photos',
        canActivate: [editorOpen],
        loadComponent: () => import('./photos/photos.page').then((m) => m.PhotosPage),
        data: { mainClass: 'container' },
        title: $localize`:@@photos.documentTitle:Photos · Sweet Hand`,
      },
      { path: '**', loadComponent: () => import('../../shell/system-page').then((m) => m.SystemPage), data: { kind: 'not-found' } },
    ],
  },
];
