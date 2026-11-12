import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

// 9) Interceptor : ajoute "Authorization: Bearer <token>" à chaque appel de l'API
//    et gère les erreurs 401 (token expiré) / 403 (droits insuffisants)
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuthCall = req.url.includes('/auth/');

  if (token && isApi && !isAuthCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthCall) {
        auth.logout(false);
        router.navigate(['/login'], { queryParams: { expired: 1 } });
      } else if (err.status === 403) {
        router.navigate(['/acces-refuse']);
      }
      return throwError(() => err);
    })
  );
};
