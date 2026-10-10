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
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
    title: $localize`:@@reset.documentTitle:Choose a new password · Sweet Hand`,
  },
  {
    path: 'verify-email/sent',
    loadComponent: () => import('./verify-email/verification-sent.page').then((m) => m.VerificationSentPage),
    title: $localize`:@@verifySent.documentTitle:Check your email · Sweet Hand`,
  },
  {
    path: 'verify-email/:token',
    loadComponent: () => import('./verify-email/verify-email.page').then((m) => m.VerifyEmailPage),
    title: $localize`:@@verify.documentTitle:Verify email · Sweet Hand`,
  },
];
