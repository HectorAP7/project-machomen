import { Routes } from '@angular/router';
import { authGuard, adminGuard, vendedorGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },

  // ── Públicas ──────────────────────────────────────────────────────────────
  { path: 'inicio',       loadComponent: () => import('./componentes/inicio/inicio').then(m => m.Inicio) },
  { path: 'catalogo',     loadComponent: () => import('./componentes/catalogo/catalogo').then(m => m.Catalogo) },
  { path: 'producto/:id', loadComponent: () => import('./componentes/detalle-producto/detalle-producto').then(m => m.DetalleProducto) },
  { path: 'login',        loadComponent: () => import('./componentes/login/login').then(m => m.Login),         canActivate: [noAuthGuard] },
  { path: 'registro',     loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro), canActivate: [noAuthGuard] },

  /**
   * Callback de Google OAuth2.
   * Ruta: /oauth2/callback?token=XXX
   * El backend Spring redirige aquí después de autenticar con Google.
   */
  { path: 'oauth2/callback', loadComponent: () => import('./componentes/oauth2-callback/oauth2-callback').then(m => m.OAuth2Callback) },

  // ── Cliente autenticado ───────────────────────────────────────────────────
  { path: 'carrito',      loadComponent: () => import('./componentes/carrito/carrito').then(m => m.Carrito),               canActivate: [authGuard] },
  { path: 'pasarela',     loadComponent: () => import('./componentes/pasarela/pasarela').then(m => m.Pasarela),             canActivate: [authGuard] },
  { path: 'confirmacion', loadComponent: () => import('./componentes/confirmacion/confirmacion').then(m => m.Confirmacion), canActivate: [authGuard] },
  { path: 'perfil',       loadComponent: () => import('./componentes/perfil/perfil').then(m => m.Perfil),                   canActivate: [authGuard] },
  { path: 'pedidos',      loadComponent: () => import('./componentes/pedidos/pedidos').then(m => m.Pedidos),                 canActivate: [authGuard] },

  // ── Panel Vendedor ────────────────────────────────────────────────────────
  {
    path: 'vendedor',
    loadComponent: () => import('./componentes/admin/vendedor-dashboard/vendedor-layout').then(m => m.VendedorLayout),
    canActivate: [vendedorGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./componentes/admin/vendedor-dashboard/vendedor-dashboard').then(m => m.VendedorDashboard) },
      { path: 'pedidos',   loadComponent: () => import('./componentes/admin/vendedor-dashboard/vendedor-dashboard').then(m => m.VendedorDashboard) },
    ]
  },

  // ── Panel Admin ───────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./componentes/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./componentes/admin/dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'pedidos',   loadComponent: () => import('./componentes/admin/pedidos/admin-pedidos').then(m => m.AdminPedidos) },
      { path: 'productos', loadComponent: () => import('./componentes/admin/productos/admin-productos-list').then(m => m.AdminProductosList) },
      { path: 'productos/nuevo',       loadComponent: () => import('./componentes/admin/productos/admin-productos-form').then(m => m.AdminProductosForm) },
      { path: 'productos/editar/:id',  loadComponent: () => import('./componentes/admin/productos/admin-productos-form').then(m => m.AdminProductosForm) },
      { path: 'categorias',            loadComponent: () => import('./componentes/admin/categorias/admin-categorias-list').then(m => m.AdminCategoriasList) },
      { path: 'categorias/nuevo',      loadComponent: () => import('./componentes/admin/categorias/admin-categorias-form').then(m => m.AdminCategoriasForm) },
      { path: 'categorias/editar/:id', loadComponent: () => import('./componentes/admin/categorias/admin-categorias-form').then(m => m.AdminCategoriasForm) },
      { path: 'vendedores',loadComponent: () => import('./componentes/admin/vendedores/admin-vendedores').then(m => m.AdminVendedores) },
      { path: 'cupones',   loadComponent: () => import('./componentes/admin/cupones/admin-cupones').then(m => m.AdminCupones) },
      { path: 'usuarios',  loadComponent: () => import('./componentes/admin/usuarios/admin-usuarios').then(m => m.AdminUsuarios) },
    ]
  },

  { path: '**', loadComponent: () => import('./componentes/not-found/not-found').then(m => m.NotFound) }
];
