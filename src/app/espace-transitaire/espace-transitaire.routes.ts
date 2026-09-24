import { Routes } from '@angular/router';
import { authGuard } from '../shared/services/auth-guard';
import { passwordChangeGuard } from '../shared/services/password-change-guard';

export const ESPACE_TRANSITAIRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./espace-transitaire-layout').then((m) => m.EspaceTransitaireLayout),
    canActivate: [authGuard, passwordChangeGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
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
        path: 'cotations',
        loadComponent: () =>
          import('./pages/demandes-cotation/demandes-cotation-page').then(
            (m) => m.DemandesCotationPage,
          ),
      },
      {
        path: 'cotations/nouvelle',
        loadComponent: () =>
          import('./pages/demande-cotation/demande-cotation-page').then(
            (m) => m.DemandeCotationPage,
          ),
      },
      {
        path: 'demande-cotation',
        redirectTo: 'cotations/nouvelle',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage),
      },
      {
        path: 'equipe',
        loadComponent: () => import('./pages/equipe/equipe-page').then((m) => m.EquipePage),
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
