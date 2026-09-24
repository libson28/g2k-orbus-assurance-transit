import { Routes } from '@angular/router';
import { authGuard } from '../shared/services/auth-guard';
import { roleGuard } from '../shared/services/role-guard';
import { passwordChangeGuard } from '../shared/services/password-change-guard';

export const BACK_OFFICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./back-office-layout').then((m) => m.BackOfficeLayout),
    canActivate: [authGuard, passwordChangeGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'demandes',
        loadComponent: () => import('./pages/demandes/demandes-page').then((m) => m.DemandesPage),
      },
      {
        path: 'contrats',
        loadComponent: () => import('./pages/contrats/contrats-page').then((m) => m.ContratsPage),
      },
      {
        path: 'operations',
        loadComponent: () =>
          import('./pages/operations/operations-page').then((m) => m.OperationsPage),
      },
      {
        path: 'souscripteurs',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
          import('./pages/souscripteurs/souscripteurs-page').then((m) => m.SouscripteursPage),
      },
      {
        path: 'agents',
        canActivate: [roleGuard(['admin', 'superviseur'])],
        loadComponent: () =>
          import('./pages/agents/agents-page').then((m) => m.AgentsPage),
      },
      {
        path: 'polices',
        canActivate: [roleGuard(['admin', 'superviseur'])],
        loadComponent: () => import('./pages/polices/polices-page').then((m) => m.PolicesPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../espace-transitaire/pages/notifications/notifications-page').then((m) => m.NotificationsPage),
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/profil/profil-page').then((m) => m.ProfilPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
