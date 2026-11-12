import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// 10) Guard de rôle : la route déclare data: { roles: ['ADMIN'] }
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] as string[]) ?? [];

  if (roles.length === 0 || auth.hasAnyRole(roles)) {
    return true;
  }
  return router.createUrlTree(['/acces-refuse']);
};
