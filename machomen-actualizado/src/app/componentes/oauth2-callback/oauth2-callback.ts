import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex align-items-center justify-content-center vh-100 bg-white">
      <div class="text-center px-4">
        <div class="spinner-border text-dark mb-4" style="width:3rem;height:3rem;" *ngIf="!error"></div>
        <i class="fa-solid fa-circle-xmark text-danger mb-3 d-block" style="font-size:3rem;" *ngIf="error"></i>
        <h5 class="fw-bold mb-2" style="font-family:'Cinzel',serif;">MACHOMEN</h5>
        <p class="text-muted small">{{ mensaje }}</p>
        <p *ngIf="error" class="text-danger small mt-2 fw-bold">{{ error }}</p>
        <a *ngIf="error" routerLink="/login"
           class="btn btn-dark rounded-0 mt-3 px-4 text-uppercase fw-bold btn-sm">
          Volver al Login
        </a>
      </div>
    </div>
  `
})
export class OAuth2Callback implements OnInit {

  mensaje = 'Verificando tu cuenta de Google...';
  error   = '';

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const err   = this.route.snapshot.queryParamMap.get('error');

    if (err) {
      this.error   = 'No se pudo autenticar con Google. Intenta de nuevo.';
      this.mensaje = '';
      return;
    }

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Guardar token primero, luego obtener el usuario COMPLETO desde el backend
    // (el JWT solo contiene id/rol/correo — no tiene nombres, dni, iddistrito, etc.)
    localStorage.setItem('token', token);

    this.mensaje = 'Cargando tu perfil...';

    this.authSvc.verificarTokenYCargarUsuario(token).subscribe({
      next: (sesion) => {
        this.authSvc.guardarSesionDesdeToken(sesion);
        this.mensaje = '¡Bienvenido! Redirigiendo...';

        const rol = sesion.usuario.rol;
        if (rol === 1)      this.router.navigate(['/admin']);
        else if (rol === 3) this.router.navigate(['/vendedor']);
        else                this.router.navigate(['/catalogo']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.error   = 'No se pudo verificar tu sesión. Intenta iniciar sesión nuevamente.';
        this.mensaje = '';
      }
    });
  }
}
