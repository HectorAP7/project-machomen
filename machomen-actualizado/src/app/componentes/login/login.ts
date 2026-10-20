import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/tienda.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styles: [':host { display:flex; flex-direction:column; flex:1; }']
})
export class Login {
  correo   = '';
  clave    = '';
  error    = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.correo || !this.clave) {
      this.error = 'Completa todos los campos.';
      return;
    }
    this.cargando = true;
    this.error    = '';

    const req: LoginRequest = { correo: this.correo.trim().toLowerCase(), clave: this.clave };

    this.auth.login(req).subscribe({
      next: res => {
        this.cargando = false;
        const rol = res.usuario?.rol;
        if (rol === 1) this.router.navigate(['/admin']);
        else if (rol === 3) this.router.navigate(['/vendedor']);
        else this.router.navigate(['/catalogo']);
      },
      error: err => {
        this.cargando = false;
        if (err.status === 401)
          this.error = typeof err.error === 'string' ? err.error : 'Correo o contraseña incorrectos.';
        else if (err.status === 0)
          this.error = 'No se puede conectar al servidor. Verifica que los microservicios estén activos.';
        else
          this.error = 'Error inesperado. Intenta de nuevo.';
      }
    });
  }

  /**
   * Redirige al backend Spring para iniciar el flujo OAuth2 con Google.
   * Spring redirige al usuario a Google, y Google vuelve al callback del backend.
   * Luego el backend redirige a /oauth2/callback?token=XXX en el frontend.
   */
  loginConGoogle() {
    // El backend Spring maneja el flujo completo de OAuth2
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  }
}
