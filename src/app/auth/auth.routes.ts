import { Routes } from '@angular/router';
import { authGuard } from '../shared/services/auth-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/change-password/change-password-page').then((m) => m.ChangePasswordPage),
  },
  {
    path: 'otp',
    loadComponent: () => import('./pages/otp/otp-page').then((m) => m.OtpPage),
  },
  {
    path: 'reset',
    loadComponent: () => import('./pages/reset/reset-page').then((m) => m.ResetPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
