import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

/** Protege rutas que requieren estar autenticado (cualquier rol) */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated) return true;
  router.navigate(['/login']);
  return false;
};

/** Protege rutas exclusivas de ADMIN (rol === 1) */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated && auth.isAdmin) return true;
  if (auth.isAuthenticated) router.navigate(['/catalogo']);
  else                      router.navigate(['/login']);
  return false;
};

/** Protege rutas de VENDEDOR (rol === 3) y también permite acceso a admin */
export const vendedorGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated && (auth.isVendedor || auth.isAdmin)) return true;
  if (auth.isAuthenticated) router.navigate(['/catalogo']);
  else                      router.navigate(['/login']);
  return false;
};

/** Redirige al destino correcto si ya está autenticado (evita volver al login) */
export const noAuthGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated) return true;
  if (auth.isAdmin)    { router.navigate(['/admin']);    return false; }
  if (auth.isVendedor) { router.navigate(['/vendedor']); return false; }
  router.navigate(['/catalogo']);
  return false;
};
