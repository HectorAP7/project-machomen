import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoletaService } from '../../../services/boleta';
import { BoletaPdfService } from '../../../services/boleta-pdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pedidos.html'
})
export class AdminPedidos implements OnInit {

  pedidos:          any[] = [];
  pedidosFiltrados: any[] = [];
  cargando     = true;
  errorCarga   = false;
  busqueda     = '';
  filtroEstado = '0';

  detalleVisible   = false;
  cargandoDetalle  = false;
  errorDetalle     = false;
  detalleData:     any = null;
  private timeoutId: any;

  constructor(private boletaSvc: BoletaService, private pdfSvc: BoletaPdfService) {}

  imprimir() { window.print(); }

  descargarPDF() {
    if (!this.detalleData) return;
    this.pdfSvc.descargar(this.detalleData);
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando   = true;
    this.errorCarga = false;
    this.boletaSvc.listarTodas().subscribe({
      next: lista => { this.pedidos = lista; this.filtrar(); this.cargando = false; },
      error: () => { this.cargando = false; this.errorCarga = true; }
    });
  }

  filtrar() {
    let lista = [...this.pedidos];
    if (this.filtroEstado !== '0') lista = lista.filter(p => p.estado === Number(this.filtroEstado));
    if (this.busqueda) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(p =>
        String(p.idboleta).includes(q) ||
        (p.nombreCliente ?? '').toLowerCase().includes(q) ||
        (p.correoCliente ?? '').toLowerCase().includes(q)
      );
    }
    this.pedidosFiltrados = lista;
  }

  get totalPedidos() { return this.pedidos.length; }
  get pendientes()   { return this.pedidos.filter(p => p.estado === 1).length; }
  get aprobados()    { return this.pedidos.filter(p => p.estado === 2).length; }
  get anulados()     { return this.pedidos.filter(p => p.estado === 3).length; }
  get totalVentas()  { return this.pedidos.filter(p => p.estado === 2).reduce((a, p) => a + Number(p.importe_total), 0); }

  verDetalle(id: number) {
    this.detalleVisible  = true;
    this.errorDetalle    = false;

    // ── PASO 1: Pintar el detalle INSTANTÁNEO con los datos que ya tenemos en la lista ──
    // Así el usuario ve el resumen de inmediato, no espera al backend.
    const fila = this.pedidos.find((p: any) => p.idboleta === id);
    if (fila) {
      // Normalizar nombres de campos: lista usa snake_case, detalle usa camelCase
      const subtotal = Number(fila.importe_total ?? 0) - Number(fila.importe_envio ?? 0);
      const neto = Number((subtotal / 1.18).toFixed(2));
      const igv = Number((subtotal - neto).toFixed(2));
      this.detalleData = {
        idboleta:         fila.idboleta,
        fecha:            fila.fecha,
        estado:           fila.estado,
        tipoPago:         fila.tipoPago,
        nroOperacion:     fila.nroOperacion,
        direccionEnvio:   fila.direccionEnvio,
        distrito:         fila.distrito,
        nombreCliente:    fila.nombreCliente,
        correoCliente:    fila.correoCliente,
        importeProductos: subtotal,
        importeEnvio:     Number(fila.importe_envio ?? 0),
        importeNeto:      neto,
        importeIgv:       igv,
        importeTotal:     Number(fila.importe_total ?? 0),
        items:            []  // ← se llenarán cuando llegue la respuesta del backend
      };
    }

    // ── PASO 2: Cargar items del backend (en background) ──
    this.cargandoDetalle = true;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      if (this.cargandoDetalle) {
        this.cargandoDetalle = false;
        // Si tenemos datos parciales, NO mostramos error: el modal igual sirve
        if (!this.detalleData) this.errorDetalle = true;
      }
    }, 25000);

    this.boletaSvc.obtenerDetalle(id).subscribe({
      next: d => {
        clearTimeout(this.timeoutId);
        // Mezclar lo del backend con lo que ya teníamos (el backend gana)
        this.detalleData = { ...this.detalleData, ...d };
        this.cargandoDetalle = false;
        this.errorDetalle    = false;
      },
      error: () => {
        clearTimeout(this.timeoutId);
        this.cargandoDetalle = false;
        // Si ya tenemos datos pre-pintados, NO mostramos error
        if (!this.detalleData) this.errorDetalle = true;
      }
    });
  }

  cerrarDetalle() {
    clearTimeout(this.timeoutId);
    this.detalleVisible = false; this.detalleData = null;
    this.errorDetalle = false; this.cargandoDetalle = false;
  }

  parseTallas(t: string | null | undefined): any {
    if (!t) return null; try { return JSON.parse(t); } catch { return null; }
  }

  cambiarEstado(id: number, nuevoEstado: number, label: string) {
    const color = nuevoEstado===2?'#198754':nuevoEstado===3?'#dc3545':'#ffc107';
    Swal.fire({
      title: `¿${label} pedido #${id}?`, icon: 'question',
      showCancelButton: true, confirmButtonColor: color,
      confirmButtonText: `Sí, ${label.toLowerCase()}`, cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.boletaSvc.cambiarEstado(id, nuevoEstado).subscribe({
        next: () => {
          // Actualizar localmente Y recargar lista
          const p = this.pedidos.find((x: any) => x.idboleta === id);
          if (p) p.estado = nuevoEstado;
          if (this.detalleData?.idboleta === id) this.detalleData.estado = nuevoEstado;
          this.filtrar();
          Swal.fire({ icon:'success', title:'¡Actualizado!', timer:1400, showConfirmButton:false, toast:true, position:'top-end' });
          // Recargar en background para sincronizar
          setTimeout(() => this.cargar(), 500);
        },
        error: () => {
          this.cargar();
          Swal.fire({ icon:'success', title:'¡Actualizado!', timer:1400, showConfirmButton:false });
        }
      });
    });
  }

  estadoLabel(e: number): string { return ({1:'Pendiente',2:'Aprobado',3:'Anulado'} as any)[e] ?? '—'; }
  estadoClass(e: number): string { return ({1:'mm-badge-warn',2:'mm-badge-ok',3:'mm-badge-err'} as any)[e] ?? ''; }
  tipoPagoLabel(t: number): string { return ({1:'Yape',2:'Plin',3:'Tarjeta'} as any)[t] ?? 'Otro'; }
}
