import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth';

/**
 * Interceptor HTTP que agrega el Bearer token JWT a todas las peticiones
 * que van al API Gateway, excepto login, registrar y las de Google OAuth2.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth  = inject(AuthService);
  const token = auth.token;

  // No agregar token en estas rutas públicas
  const esPublico =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/registrar') ||
    req.url.includes('/api/auth/me') ||
    req.url.includes('/oauth2/') ||
    req.url.includes('/login/oauth2/') ||
    req.url.includes('googleapis.com') ||
    req.url.includes('accounts.google.com');

  if (token && !esPublico) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
