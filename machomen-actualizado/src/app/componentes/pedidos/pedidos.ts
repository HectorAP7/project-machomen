import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { BoletaService } from '../../services/boleta';
import { BoletaPdfService } from '../../services/boleta-pdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pedidos.html'
})
export class Pedidos implements OnInit {

  pedidos:        any[] = [];
  cargando        = true;
  errorCarga      = false;
  detalleVisible  = false;
  cargandoDetalle = false;
  errorDetalle    = false;
  detalleData:    any = null;
  private timeoutId: any;

  constructor(public auth: AuthService, private boletaSvc: BoletaService, private pdfSvc: BoletaPdfService) {}

  imprimir() { window.print(); }

  descargarPDF() {
    if (!this.detalleData) return;
    this.pdfSvc.descargar(this.detalleData);
    Swal.fire({ icon:'success', title:'¡PDF descargado!', timer:1500, showConfirmButton:false, toast:true, position:'top-end' });
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    const id = this.auth.usuario?.idusuario;
    if (!id) { this.cargando = false; return; }
    this.cargando   = true;
    this.errorCarga = false;
    this.boletaSvc.listarPorUsuario(id).subscribe({
      next: lista => { this.pedidos = lista; this.cargando = false; },
      error: () => { this.cargando = false; this.errorCarga = true; }
    });
  }

  verDetalle(id: number) {
    this.detalleVisible  = true;
    this.errorDetalle    = false;

    // ── PASO 1: Pre-pintar el modal con datos que ya tenemos de la lista ──
    const fila = this.pedidos.find((p: any) => p.idboleta === id);
    if (fila) {
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
        items:            []
      };
    }

    // ── PASO 2: Pedir items al backend en background ──
    this.cargandoDetalle = true;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      if (this.cargandoDetalle) {
        this.cargandoDetalle = false;
        if (!this.detalleData) this.errorDetalle = true;
      }
    }, 25000);

    this.boletaSvc.obtenerDetalle(id).subscribe({
      next: d => {
        clearTimeout(this.timeoutId);
        this.detalleData = { ...this.detalleData, ...d };
        this.cargandoDetalle = false;
        this.errorDetalle    = false;
      },
      error: () => {
        clearTimeout(this.timeoutId);
        this.cargandoDetalle = false;
        if (!this.detalleData) this.errorDetalle = true;
      }
    });
  }

  cerrar() {
    clearTimeout(this.timeoutId);
    this.detalleVisible  = false;
    this.detalleData     = null;
    this.errorDetalle    = false;
    this.cargandoDetalle = false;
  }

  parseTallas(tallaJson: string | null | undefined): any {
    if (!tallaJson) return null;
    try { return JSON.parse(tallaJson); } catch { return null; }
  }

  get totalGastado(): number {
    return this.pedidos.filter(p => p.estado === 2)
      .reduce((a: number, p: any) => a + Number(p.importe_total), 0);
  }

  estadoLabel(e: number): string   { return ({1:'Pendiente',2:'Aprobado',3:'Anulado'} as any)[e] ?? '—'; }
  tipoPagoLabel(t: number): string { return ({1:'Yape',2:'Plin',3:'Tarjeta'} as any)[t] ?? 'Otro'; }
}
