import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // ✅ Fixed: match actual URLs used in auth.service.ts (no /api prefix)
  const isAuthCall =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh');

  let modifiedReq = req;
  const token = authService.getToken();

  // ✅ Only attach token if:
  // 1. NOT auth call
  // 2. token exists
  if (!isAuthCall && token) {
    modifiedReq = addToken(req, token);
  }

  return next(modifiedReq).pipe(
    catchError((err) => {
      if (err.status === 401 && !isAuthCall) {
        const currentToken = authService.getToken();
        const refreshToken = authService.getRefreshToken();

        // Only treat 401s as session expiry if the access token is actually expired.
        // Otherwise surface the API error so page-specific auth issues don't force logout.
        if (currentToken && !isTokenExpired(currentToken)) {
          return throwError(() => err);
        }

        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              const retryReq = addToken(req, res.accessToken);
              return next(retryReq);
            }),
            catchError((refreshErr) => {
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          authService.logout();
          return throwError(() => err); // ✅ Fixed: was missing return
        }
      }
      return throwError(() => err);
    })
  );
};

// ── Helper: clone request with Bearer token ──────────────────────────
function addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
