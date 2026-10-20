import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { DistritoService } from '../../services/distrito';
import { Distrito, RegistroClienteRequest } from '../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class Registro implements OnInit {

  distritos: Distrito[] = [];
  cargando  = false;
  verClave  = false;
  verClave2 = false;

  form: RegistroClienteRequest & { clave2: string } = {
    nombres: '', apellidos: '', dni: '', correo: '',
    clave: '', clave2: '', celular: '', direccion: '', iddistrito: 0
  };

  constructor(
    private auth:        AuthService,
    private distritoSvc: DistritoService,
    private router:      Router
  ) {}

  ngOnInit() {
    this.distritoSvc.listar().subscribe({ next: d => this.distritos = d, error: () => {} });
  }

  get clavesNoCoinciden(): boolean {
    return !!(this.form.clave2 && this.form.clave !== this.form.clave2);
  }

  /** Redirige al backend Spring para iniciar el flujo OAuth2 con Google */
  loginConGoogle() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  }

  registrar() {
    const f = this.form;
    if (!f.nombres || !f.apellidos || !f.dni || !f.correo || !f.clave) {
      Swal.fire('Atención', 'Completa todos los campos obligatorios (*).', 'warning'); return;
    }
    if (f.dni.length !== 8 || !/^\d+$/.test(f.dni)) {
      Swal.fire('DNI inválido', 'El DNI debe tener exactamente 8 dígitos numéricos.', 'warning'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) {
      Swal.fire('Correo inválido', 'Ingresa un correo electrónico válido.', 'warning'); return;
    }
    if (f.clave.length < 6) {
      Swal.fire('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.', 'warning'); return;
    }
    if (f.clave !== f.clave2) {
      Swal.fire('Contraseñas distintas', 'Las contraseñas no coinciden.', 'warning'); return;
    }

    const payload: RegistroClienteRequest = {
      nombres:    f.nombres.trim(),
      apellidos:  f.apellidos.trim(),
      dni:        f.dni.trim(),
      correo:     f.correo.trim().toLowerCase(),
      clave:      f.clave,
      celular:    f.celular?.trim() || undefined,
      direccion:  f.direccion?.trim() || undefined,
      iddistrito: f.iddistrito && f.iddistrito > 0 ? f.iddistrito : undefined
    };

    this.cargando = true;
    this.auth.registrar(payload).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'success', title: '¡Cuenta creada!',
          text: 'Ya puedes iniciar sesión con tu correo y contraseña.',
          confirmButtonColor: '#111', confirmButtonText: 'Ir al Login'
        }).then(() => this.router.navigate(['/login']));
      },
      error: (err) => {
        this.cargando = false;
        const msg = typeof err.error === 'string' ? err.error
          : err.error?.message || 'No se pudo completar el registro. El DNI o correo ya pueden estar en uso.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }
}
