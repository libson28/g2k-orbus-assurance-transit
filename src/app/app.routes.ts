import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./portail/portail.routes').then((m) => m.PORTAIL_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'espace-transitaire',
    loadChildren: () =>
      import('./espace-transitaire/espace-transitaire.routes').then(
        (m) => m.ESPACE_TRANSITAIRE_ROUTES,
      ),
  },
  {
    path: 'back-office',
    loadChildren: () => import('./back-office/back-office.routes').then((m) => m.BACK_OFFICE_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
