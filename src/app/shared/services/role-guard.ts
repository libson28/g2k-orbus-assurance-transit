import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth-service';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.currentUser()?.role;

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/back-office/dashboard']);
  };
}
