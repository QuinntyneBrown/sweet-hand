import type { Routes } from '@angular/router';

export const discoveryRoutes: Routes = [
  {
    path: 'caterers',
    loadComponent: () => import('./listing/listing.page').then((m) => m.ListingPage),
    data: { mainClass: 'container' },
    title: $localize`:@@listing.documentTitle:Caterers · Sweet Hand`,
  },
  {
    path: 'occasions',
    loadComponent: () => import('./occasions/occasions.page').then((m) => m.OccasionsPage),
    data: { mainClass: 'container' },
    title: $localize`:@@occasions.documentTitle:Occasions · Sweet Hand`,
  },
  // Public content pages, linked from the footer.
  {
    path: 'about',
    loadComponent: () => import('./static-pages/about.page').then((m) => m.AboutPage),
    data: { mainClass: 'container container--narrow' },
    title: $localize`:@@about.documentTitle:About · Sweet Hand`,
  },
  {
    path: 'privacy',
    pathMatch: 'full',
    loadComponent: () => import('./static-pages/privacy.page').then((m) => m.PrivacyPage),
    data: { mainClass: 'container' },
    title: $localize`:@@privacy.documentTitle:Privacy notice · Sweet Hand`,
  },
  {
    path: 'terms',
    loadComponent: () => import('./static-pages/terms.page').then((m) => m.TermsPage),
    data: { mainClass: 'container' },
    title: $localize`:@@terms.documentTitle:Terms · Sweet Hand`,
  },
  {
    // The page sets its own title and the classes of <main> from what it shows.
    path: 'caterers/:slug',
    loadComponent: () => import('./caterer/caterer.page').then((m) => m.CatererPage),
  },
];
