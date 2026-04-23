import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

const roleRedirect: Record<string, string> = {
  'ROLE_ADMIN': '/admin/dashboard',
  'ROLE_HR':    '/hr/dashboard',
  'ROLE_EMP':   '/employee/dashboard',
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService  = inject(AuthService);
  const router       = inject(Router);
  const userRole     = authService.getRole();
  const requiredRole = route.data?.['role'] as string | undefined;

  if (!requiredRole || userRole === requiredRole) return true;

  const redirect = userRole ? (roleRedirect[userRole] ?? '/login') : '/login';
  return router.createUrlTree([redirect]);
};

/** Alias used by master-data routes — checks for ROLE_ADMIN */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const role        = authService.getRole();
  if (role === 'ROLE_ADMIN') return true;
  const redirect = role ? (roleRedirect[role] ?? '/login') : '/login';
  return router.createUrlTree([redirect]);
};