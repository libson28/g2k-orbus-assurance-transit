import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

/** Blocks access to the app until a first-login account has changed its provisional password. */
export const passwordChangeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()?.mustChangePassword) {
    return router.createUrlTree(['/auth/change-password']);
  }

  return true;
};
