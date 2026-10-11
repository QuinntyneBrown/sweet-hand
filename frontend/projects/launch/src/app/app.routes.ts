import type { Routes } from '@angular/router';
import { LaunchPage } from './launch-page/launch-page';

export const routes: Routes = [
  { path: '', component: LaunchPage, title: $localize`:@@launch.documentTitle:Sweet Hand · Opening soon in Toronto and the GTA` },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/launch-privacy-page').then((m) => m.LaunchPrivacyPage),
    title: $localize`:@@launch.privacy.documentTitle:Privacy · Sweet Hand`,
  },
  { path: '**', redirectTo: '' },
];
