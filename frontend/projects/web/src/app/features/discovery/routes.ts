import type { Routes } from '@angular/router';

export const discoveryRoutes: Routes = [
  {
    path: 'caterers',
    loadComponent: () => import('./listing/listing.page').then((m) => m.ListingPage),
    data: { mainClass: 'container' },
    title: $localize`:@@listing.documentTitle:Caterers · Sweet Hand`,
  },
  {
    // The page sets its own title and the classes of <main> from what it shows.
    path: 'caterers/:slug',
    loadComponent: () => import('./caterer/caterer.page').then((m) => m.CatererPage),
  },
];
