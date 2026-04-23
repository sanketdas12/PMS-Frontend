import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router      = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getToken();

  if (!token) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  if (!isTokenExpired(token)) {
    return true;
  }

  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    authService.logout();
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return authService.refreshToken().pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    })
  );
};

// function isTokenExpired(token: string): boolean {
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return Date.now() > payload.exp * 1000;
//   } catch {
//     return true;
//   }
// }
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    console.error('Invalid token:', e);
    return true;
  }
}