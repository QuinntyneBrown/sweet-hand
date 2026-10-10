import type { Routes } from '@angular/router';
import { discoveryRoutes } from './features/discovery/routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'caterers' },
  ...discoveryRoutes,
];
