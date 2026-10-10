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
  {
    path: 'join',
    loadComponent: () => import('./register-caterer/register-caterer.page').then((m) => m.RegisterCatererPage),
    title: $localize`:@@registerCaterer.documentTitle:Cater with Sweet Hand`,
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
    title: $localize`:@@forgot.documentTitle:Forgot password · Sweet Hand`,
  },
];
