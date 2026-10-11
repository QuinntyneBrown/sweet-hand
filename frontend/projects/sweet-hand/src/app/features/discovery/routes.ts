import type { Routes } from '@angular/router';
import { page } from '../../core/routing/page';

export const discoveryRoutes: Routes = [
  page('caterers', () => import('./listing/listing.page').then((m) => m.ListingPage), $localize`:@@listing.documentTitle:Caterers`),
  page('occasions', () => import('./occasions/occasions.page').then((m) => m.OccasionsPage), $localize`:@@occasions.documentTitle:Occasions`),
  // Public content pages, linked from the footer.
  page('about', () => import('./static-pages/about.page').then((m) => m.AboutPage), $localize`:@@about.documentTitle:About`, {
    data: { mainClass: 'container container--narrow' },
  }),
  page('privacy', () => import('./static-pages/privacy.page').then((m) => m.PrivacyPage), $localize`:@@privacy.documentTitle:Privacy notice`, { pathMatch: 'full' }),
  page('terms', () => import('./static-pages/terms.page').then((m) => m.TermsPage), $localize`:@@terms.documentTitle:Terms`),
  {
    // The page sets its own title and the classes of <main> from what it shows.
    path: 'caterers/:slug',
    loadComponent: () => import('./caterer/caterer.page').then((m) => m.CatererPage),
  },
];
