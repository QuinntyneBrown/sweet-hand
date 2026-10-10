import type { Routes } from '@angular/router';

export const discoveryRoutes: Routes = [
  {
    path: 'caterers',
    loadComponent: () => import('./listing/listing.page').then((m) => m.ListingPage),
    data: { mainClass: 'container' },
    title: $localize`:@@listing.documentTitle:Caterers · Sweet Hand`,
  },
];
