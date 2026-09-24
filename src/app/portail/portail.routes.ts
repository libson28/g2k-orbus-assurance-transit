import { Routes } from '@angular/router';

export const PORTAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../shared/layouts/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: 'accueil',
        loadComponent: () => import('./pages/accueil/accueil-page').then((m) => m.AccueilPage),
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/services/services-page').then((m) => m.ServicesPage),
      },
      {
        path: 'demander-une-cotation',
        loadComponent: () =>
          import('./pages/demande-publique/demande-publique-page').then((m) => m.DemandePubliquePage),
      },
      {
        path: 'suivre-ma-demande',
        loadComponent: () =>
          import('./pages/suivre-demande/suivre-demande-page').then((m) => m.SuivreDemandePage),
      },
      {
        path: '',
        redirectTo: 'accueil',
        pathMatch: 'full',
      },
      // TODO: sous-pages du portail à compléter
    ],
  },
];
