import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario';
import { DistritoService } from '../../../services/distrito';
import { AuthService } from '../../../services/auth';
import { Usuario, Distrito, RegistroClienteRequest } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html'
})
export class AdminUsuarios implements OnInit {
  usuarios:  Usuario[]  = [];
  filtrados: Usuario[]  = [];
  distritos: Distrito[] = [];
  cargando   = true;
  errorCarga = false;
  busqueda   = '';
  filtroRol  = '0';

  mostrarForm = false;
  guardando   = false;
  verClave    = false;
  verClave2   = false;

  nuevoCliente: RegistroClienteRequest & { clave2: string } = {
    nombres: '', apellidos: '', dni: '', correo: '',
    clave: '', clave2: '', celular: '', direccion: '', iddistrito: 0
  };

  constructor(
    private svc:         UsuarioService,
    private distritoSvc: DistritoService,
    private authSvc:     AuthService
  ) {}

  ngOnInit() {
    this.cargar();
    this.distritoSvc.listar().subscribe({ next: d => this.distritos = d, error: () => {} });
  }

  cargar() {
    this.cargando   = true;
    this.errorCarga = false;
    this.svc.listarTodos().subscribe({
      next: lista => {
        this.usuarios = lista.sort((a, b) => b.idusuario - a.idusuario);
        this.filtrar();
        this.cargando = false;
      },
      error: () => { this.cargando = false; this.errorCarga = true; }
    });
  }

  filtrar() {
    let lista = [...this.usuarios];
    if (this.filtroRol !== '0') lista = lista.filter(u => u.rol === Number(this.filtroRol));
    if (this.busqueda) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(u =>
        (u.nombres + ' ' + u.apellidos).toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.dni.includes(q)
      );
    }
    this.filtrados = lista;
  }

  abrirFormCliente() {
    this.nuevoCliente = { nombres: '', apellidos: '', dni: '', correo: '', clave: '', clave2: '', celular: '', direccion: '', iddistrito: 0 };
    this.verClave = false; this.verClave2 = false;
    this.mostrarForm = true;
  }

  guardarCliente() {
    const f = this.nuevoCliente;
    if (!f.nombres || !f.apellidos || !f.dni || !f.correo || !f.clave) {
      Swal.fire('Atención', 'Completa los campos obligatorios (*).', 'warning'); return;
    }
    if (f.dni.length !== 8 || !/^\d+$/.test(f.dni)) {
      Swal.fire('Atención', 'El DNI debe tener exactamente 8 dígitos.', 'warning'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) {
      Swal.fire('Atención', 'Ingresa un correo electrónico válido.', 'warning'); return;
    }
    if (f.clave.length < 6) {
      Swal.fire('Atención', 'La contraseña debe tener al menos 6 caracteres.', 'warning'); return;
    }
    if (f.clave !== f.clave2) {
      Swal.fire('Atención', 'Las contraseñas no coinciden.', 'warning'); return;
    }

    const payload: RegistroClienteRequest = {
      nombres: f.nombres.trim(), apellidos: f.apellidos.trim(),
      dni: f.dni.trim(), correo: f.correo.trim().toLowerCase(),
      clave: f.clave,
      celular:    f.celular?.trim()   || undefined,
      direccion:  f.direccion?.trim() || undefined,
      iddistrito: f.iddistrito && f.iddistrito > 0 ? f.iddistrito : undefined
    };

    this.guardando = true;
    this.authSvc.registrar(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarForm = false;
        this.cargar();
        Swal.fire({ icon: 'success', title: '¡Creado!', text: 'Cliente registrado exitosamente.', timer: 2000, showConfirmButton: false });
      },
      error: (err) => {
        this.guardando = false;
        const msg = typeof err.error === 'string' ? err.error
          : err.error?.message || 'DNI o correo ya registrado.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  cambiarEstado(u: Usuario) {
    const nuevo  = u.estado === 1 ? 0 : 1;
    const accion = nuevo === 1 ? 'activar' : 'desactivar';
    const color  = nuevo === 1 ? '#198754' : '#dc3545';

    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      html: `<strong>${u.nombres} ${u.apellidos}</strong><br><small class="text-muted">${u.correo}</small>`,
      icon: nuevo === 1 ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: color,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.svc.cambiarEstado(u.idusuario, nuevo).subscribe({
        next: () => {
          u.estado = nuevo;
          this.filtrar();
          Swal.fire({
            icon: nuevo === 1 ? 'success' : 'info',
            title: nuevo === 1 ? '¡Usuario activado!' : 'Usuario desactivado',
            text: `${u.nombres} ${u.apellidos} ahora está ${nuevo === 1 ? 'activo' : 'inactivo'}.`,
            timer: 2500, showConfirmButton: false,
            position: 'top-end', toast: true
          });
        },
        error: () => Swal.fire('Error', 'No se pudo cambiar el estado. Verifica la conexión.', 'error')
      });
    });
  }

  rolLabel(r: number): string { return ({1:'Admin', 2:'Cliente', 3:'Vendedor'} as any)[r] ?? '?'; }
  rolClass(r: number): string { return ({1:'bg-dark', 2:'bg-primary', 3:'bg-warning text-dark'} as any)[r] ?? 'bg-secondary'; }

  get totalClientes(): number { return this.usuarios.filter(u => u.rol === 2).length; }
  get totalActivos():  number { return this.usuarios.filter(u => u.estado === 1).length; }
  get totalInactivos():number { return this.usuarios.filter(u => u.estado === 0).length; }
}
