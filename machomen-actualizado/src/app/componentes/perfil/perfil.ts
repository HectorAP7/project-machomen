import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UsuarioService } from '../../services/usuario';
import { DistritoService } from '../../services/distrito';
import { Distrito } from '../../models/tienda.models';
import Swal from 'sweetalert2';

interface PerfilForm {
  idusuario: number; nombres: string; apellidos: string; dni: string;
  correo: string; celular: string; direccion: string; iddistrito: number;
  rol: number; estado: number; claveNueva: string; claveRepetir: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  usuario: PerfilForm = {
    idusuario: 0, nombres: '', apellidos: '', dni: '', correo: '',
    celular: '', direccion: '', iddistrito: 0, rol: 2, estado: 1,
    claveNueva: '', claveRepetir: ''
  };

  distritos:  Distrito[] = [];
  cargando    = true;
  guardando   = false;
  verClave    = false;
  verClave2   = false;
  tabActiva   = 'datos';

  constructor(
    private authSvc:     AuthService,
    private usuarioSvc:  UsuarioService,
    private distritoSvc: DistritoService
  ) {}

  ngOnInit() {
    this.distritoSvc.listar().subscribe({ next: d => this.distritos = d, error: () => {} });

    const id = this.authSvc.usuario?.idusuario;
    if (!id) { this.cargando = false; return; }

    this.usuarioSvc.obtenerPerfil(id).subscribe({
      next: u => {
        this.usuario = {
          ...u,
          celular:      u.celular     ?? '',
          direccion:    u.direccion   ?? '',
          iddistrito:   u.iddistrito  ?? 0,
          claveNueva:   '',
          claveRepetir: ''
        };
        this.cargando = false;
      },
      error: () => {
        const u = this.authSvc.usuario!;
        this.usuario = {
          idusuario: u.idusuario, nombres: u.nombres, apellidos: u.apellidos,
          dni: u.dni ?? '', correo: u.correo, celular: u.celular ?? '',
          direccion: u.direccion ?? '', iddistrito: u.iddistrito ?? 0,
          rol: u.rol, estado: u.estado, claveNueva: '', claveRepetir: ''
        };
        this.cargando = false;
      }
    });
  }

  get iniciales(): string {
    return ((this.usuario.nombres?.[0] ?? '') + (this.usuario.apellidos?.[0] ?? '')).toUpperCase();
  }

  guardarDatos() {
    if (!this.usuario.nombres?.trim() || !this.usuario.apellidos?.trim()) {
      Swal.fire('Atención', 'Nombres y apellidos son obligatorios.', 'warning'); return;
    }
    if (this.usuario.dni && (this.usuario.dni.length !== 8 || !/^\d{8}$/.test(this.usuario.dni))) {
      Swal.fire('DNI inválido', 'El DNI debe tener 8 dígitos numéricos.', 'warning'); return;
    }

    const payload: any = {
      nombres:    this.usuario.nombres.trim(),
      apellidos:  this.usuario.apellidos.trim(),
      dni:        this.usuario.dni?.trim() || null,
      celular:    this.usuario.celular?.trim() || null,
      direccion:  this.usuario.direccion?.trim() || null,
      iddistrito: Number(this.usuario.iddistrito) || 0
    };

    this.guardando = true;
    this.usuarioSvc.actualizarPerfil(this.usuario.idusuario, payload).subscribe({
      next: (updated: any) => {
        this.guardando = false;
        // Actualizar sesión con datos nuevos
        const sesion = this.authSvc.currentUser;
        if (sesion) {
          sesion.usuario.nombres   = updated.nombres;
          sesion.usuario.apellidos = updated.apellidos;
          sesion.usuario.celular   = updated.celular;
          sesion.usuario.direccion = updated.direccion;
          sesion.usuario.iddistrito = updated.iddistrito;
          this.authSvc.guardarSesionDesdeToken(sesion);
        }
        Swal.fire({ icon: 'success', title: '¡Guardado!',
          text: 'Tus datos fueron actualizados correctamente.',
          timer: 2000, showConfirmButton: false });
      },
      error: (err) => {
        this.guardando = false;
        const msg = typeof err.error === 'string' ? err.error
          : err.error?.message || 'No se pudo actualizar el perfil. Intenta de nuevo.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  cambiarClave() {
    if (!this.usuario.claveNueva || this.usuario.claveNueva.length < 6) {
      Swal.fire('Atención', 'La nueva contraseña debe tener al menos 6 caracteres.', 'warning'); return;
    }
    if (this.usuario.claveNueva !== this.usuario.claveRepetir) {
      Swal.fire('Atención', 'Las contraseñas no coinciden.', 'warning'); return;
    }

    this.guardando = true;
    this.usuarioSvc.actualizarPerfil(this.usuario.idusuario, { clave: this.usuario.claveNueva } as any).subscribe({
      next: () => {
        this.guardando = false;
        this.usuario.claveNueva = '';
        this.usuario.claveRepetir = '';
        Swal.fire({
          icon: 'success', title: '¡Contraseña actualizada!',
          text: 'Por seguridad, vuelve a iniciar sesión.',
          timer: 2500, showConfirmButton: false
        }).then(() => this.authSvc.logout());
      },
      error: (err) => {
        this.guardando = false;
        const msg = typeof err.error === 'string' ? err.error
          : err.error?.message || 'No se pudo cambiar la contraseña.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }
}
