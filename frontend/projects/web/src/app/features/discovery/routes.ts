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
];
