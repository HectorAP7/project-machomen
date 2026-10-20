import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario';
import { DistritoService } from '../../../services/distrito';
import { Usuario, Distrito } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-vendedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-vendedores.html'
})
export class AdminVendedores implements OnInit {
  vendedores: Usuario[] = [];
  distritos:  Distrito[] = [];
  cargando    = true;
  mostrarForm = false;
  verClave    = false;
  guardando   = false;
  modoEdicion = false;
  idEditando  = 0;

  errores: Record<string, string> = {};

  nuevo = {
    nombres:'', apellidos:'', dni:'', correo:'',
    clave:'', celular:'', iddistrito:0, direccion:'', rol:3
  };

  constructor(private usuarioSvc: UsuarioService, private distritoSvc: DistritoService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarVendedores();
    this.distritoSvc.listar().subscribe({ next: d => { this.distritos = d; this.cd.detectChanges(); }, error: () => {} });
  }

  cargarVendedores() {
    this.cargando = true;
    this.usuarioSvc.listarVendedores().subscribe({
      next: lista => { this.vendedores = lista.sort((a,b) => b.idusuario - a.idusuario); this.cargando = false; this.cd.detectChanges(); },
      error: () => { this.cargando = false; this.cd.detectChanges(); }
    });
  }

  abrirForm() {
    this.modoEdicion = false;
    this.idEditando  = 0;
    this.nuevo = { nombres:'', apellidos:'', dni:'', correo:'', clave:'', celular:'', iddistrito:0, direccion:'', rol:3 };
    this.errores  = {};
    this.verClave = false;
    this.mostrarForm = true;
  }

  editarVendedor(v: Usuario) {
    this.modoEdicion = true;
    this.idEditando  = v.idusuario;
    this.nuevo = {
      nombres:    v.nombres,
      apellidos:  v.apellidos,
      dni:        v.dni,
      correo:     v.correo,
      clave:      '',
      celular:    v.celular ?? '',
      iddistrito: v.iddistrito ?? 0,
      direccion:  v.direccion ?? '',
      rol:        3
    };
    this.errores  = {};
    this.verClave = false;
    this.mostrarForm = true;
  }

  validarCampo(campo: string) {
    this.errores[campo] = '';
    switch (campo) {
      case 'nombres':   if (!this.nuevo.nombres.trim())    this.errores['nombres']   = 'Obligatorio.'; break;
      case 'apellidos': if (!this.nuevo.apellidos.trim())  this.errores['apellidos'] = 'Obligatorio.'; break;
      case 'dni':
        if (!this.nuevo.dni) { this.errores['dni'] = 'Obligatorio.'; break; }
        if (!/^\d{8}$/.test(this.nuevo.dni)) this.errores['dni'] = 'Debe tener 8 dígitos.';
        break;
      case 'correo':
        if (!this.nuevo.correo) { this.errores['correo'] = 'Obligatorio.'; break; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.nuevo.correo)) this.errores['correo'] = 'Correo inválido.';
        break;
      case 'clave':
        if (!this.modoEdicion && !this.nuevo.clave) { this.errores['clave'] = 'Obligatorio.'; break; }
        if (this.nuevo.clave && this.nuevo.clave.length < 6) this.errores['clave'] = 'Mínimo 6 caracteres.';
        break;
      case 'celular':
        if (this.nuevo.celular && !/^\d{7,15}$/.test(this.nuevo.celular)) this.errores['celular'] = 'Solo dígitos (7-15).';
        break;
    }
  }

  private validarTodo(): boolean {
    const campos = ['nombres','apellidos','dni','correo','celular'];
    if (!this.modoEdicion) campos.push('clave');
    campos.forEach(c => this.validarCampo(c));
    return !Object.values(this.errores).some(e => !!e);
  }

  guardar() {
    if (!this.validarTodo()) {
      Swal.fire('Atención', 'Corrige los errores antes de guardar.', 'warning'); return;
    }

    const payload: any = { ...this.nuevo, rol: 3 };
    if (!payload.iddistrito || payload.iddistrito === 0) payload.iddistrito = null;
    if (!payload.celular)  delete payload.celular;
    if (!payload.clave)    delete payload.clave;

    this.guardando = true;

    if (this.modoEdicion) {
      this.usuarioSvc.actualizarPerfil(this.idEditando, payload).subscribe({
        next: () => {
          this.guardando = false; this.mostrarForm = false;
          this.cargarVendedores();
          Swal.fire({
            icon: 'success',
            title: '¡Vendedor actualizado!',
            text: 'Los cambios fueron guardados correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#111'
          });
        },
        error: (err) => {
          this.guardando = false;
          Swal.fire({
            icon: 'error',
            title: 'No se pudo actualizar',
            text: err?.error?.message || err?.error || 'Verifica los datos e inténtalo de nuevo.',
            confirmButtonColor: '#111'
          });
        }
      });
    } else {
      const nombreCompleto = `${this.nuevo.nombres} ${this.nuevo.apellidos}`.trim();
      this.usuarioSvc.crearVendedor(payload).subscribe({
        next: () => {
          this.guardando = false;
          this.mostrarForm = false;
          this.cargarVendedores();
          // Modal de éxito CON botón OK (no auto-cierra) para que el admin lo vea claramente
          Swal.fire({
            icon: 'success',
            title: '¡Vendedor creado!',
            html: `La cuenta de <b>${nombreCompleto}</b> fue registrada correctamente.<br><br>
                   <small class="text-muted">Correo: ${this.nuevo.correo}</small>`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#111'
          });
        },
        error: (err) => {
          this.guardando = false;
          Swal.fire({
            icon: 'error',
            title: 'No se pudo crear el vendedor',
            text: err?.error?.message || err?.error || 'DNI o correo ya registrado.',
            confirmButtonColor: '#111'
          });
        }
      });
    }
  }

  cambiarEstado(v: Usuario) {
    const nuevo = v.estado === 1 ? 0 : 1;
    const label = nuevo === 1 ? 'Activar' : 'Desactivar';
    Swal.fire({
      title: `¿${label} a ${v.nombres}?`,
      icon: nuevo === 1 ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: nuevo === 1 ? '#198754' : '#dc3545',
      confirmButtonText: `Sí, ${label.toLowerCase()}`,
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.usuarioSvc.cambiarEstado(v.idusuario, nuevo).subscribe({
        next: () => {
          v.estado = nuevo;
          Swal.fire({
            icon: nuevo===1?'success':'info',
            title: nuevo===1 ? `${v.nombres} activado` : `${v.nombres} desactivado`,
            timer: 2000, showConfirmButton: false, toast: true, position: 'top-end'
          });
        },
        error: () => Swal.fire('Error', 'No se pudo cambiar el estado.', 'error')
      });
    });
  }
}
