import { inject } from '@angular/core';
import { Router, type CanActivateFn, type Routes } from '@angular/router';
import { page } from '../../core/routing/page';
import { paths } from '../../core/routing/paths';
import { requireRole } from '../../core/session/guards';
import { Session } from '../../core/session/session';
import { system } from '../../shell/system-route';

/** A removed caterer cannot edit their profile; the overview explains why (L2-058.5). */
const editorOpen: CanActivateFn = () =>
  inject(Session).user()?.caterer?.status === 'Removed' ? inject(Router).parseUrl(paths.dashboard.overview) : true;

const editor = { canActivate: [editorOpen] };

/**
 * Routes of the dashboard area; every page needs the role (L2-079).
 * `/dashboard/enquiries*` belongs to the enquiries area and is matched first (app.routes.ts).
 */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [requireRole('Caterer')],
    children: [
      page('', () => import('./overview/overview.page').then((m) => m.OverviewPage), $localize`:@@dashboard.documentTitle:Dashboard`, { pathMatch: 'full' }),
      page('profile/details', () => import('./details/details.page').then((m) => m.DetailsPage), $localize`:@@details.documentTitle:Business details`, editor),
      page('profile/cuisines', () => import('./cuisines/cuisines.page').then((m) => m.CuisinesPage), $localize`:@@cuisines.documentTitle:Cuisines and areas`, editor),
      page('profile/events', () => import('./events/events.page').then((m) => m.EventsPage), $localize`:@@events.documentTitle:Guests and occasions`, editor),
      page('profile/photos', () => import('./photos/photos.page').then((m) => m.PhotosPage), $localize`:@@photos.documentTitle:Photos`, editor),
      page('profile/menu', () => import('./menu/menu.page').then((m) => m.MenuPage), $localize`:@@menu.documentTitle:Menu`, editor),
      page('profile/food-safety', () => import('./certificate/certificate.page').then((m) => m.CertificatePage), $localize`:@@certificate.documentTitle:Food safety`, editor),
      page('reviews', () => import('./reviews/reviews.page').then((m) => m.ReviewsPage), $localize`:@@reviews.documentTitle:Reviews`),
      system('**', 'not-found'),
    ],
  },
];
