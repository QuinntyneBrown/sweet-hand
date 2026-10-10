import type { Routes } from '@angular/router';

export const identityRoutes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./sign-in/sign-in.page').then((m) => m.SignInPage),
    title: $localize`:@@signIn.documentTitle:Sign in · Sweet Hand`,
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
    title: $localize`:@@register.documentTitle:Create an account · Sweet Hand`,
  },
];
