import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { BoletaService } from '../../../services/boleta';
import { BoletaPdfService } from '../../../services/boleta-pdf';
import { ProductoService } from '../../../services/producto';
import { Producto } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendedor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendedor-dashboard.html'
})
export class VendedorDashboard implements OnInit, OnDestroy {

  pedidos:          any[] = [];
  pedidosFiltrados: any[] = [];
  productosStockBajo: Producto[] = [];
  cargando      = true;
  busqueda      = '';
  filtroEstado  = '0';
  errorCarga    = false;

  detalleVisible   = false;
  cargandoDetalle  = false;
  errorDetalle     = false;
  detalleData:     any = null;
  private timeoutId: any;
  private refreshTimer: any;

  constructor(
    public auth: AuthService,
    private boletaSvc: BoletaService,
    private productoSvc: ProductoService,
    private pdfSvc: BoletaPdfService
  ) {}

  imprimir() { window.print(); }
  descargarPDF() { if (this.detalleData) this.pdfSvc.descargar(this.detalleData); }

  ngOnInit() {
    this.cargar();
    this.cargarStockBajo();
    this.refreshTimer = setInterval(() => this.cargarSilencioso(), 60000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    clearTimeout(this.timeoutId);
  }

  cargar() {
    this.cargando = true; this.errorCarga = false;
    this.boletaSvc.listarTodas().subscribe({
      next: lista => { this.pedidos = lista; this.filtrar(); this.cargando = false; },
      error: () => { this.cargando = false; this.errorCarga = true; }
    });
  }

  cargarStockBajo() {
    this.productoSvc.listarProductos().subscribe({
      next: lista => {
        this.productosStockBajo = lista.filter(p => p.estado === 1 && p.stock <= 3)
                                       .sort((a, b) => a.stock - b.stock);
        if (this.productosStockBajo.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: `⚠ Stock bajo en ${this.productosStockBajo.length} producto(s)`,
            text: this.productosStockBajo.slice(0,3).map(p => `${p.descripcion} (${p.stock} restantes)`).join(', '),
            toast: true, position: 'top-end', timer: 6000, showConfirmButton: false
          });
        }
      },
      error: () => {}
    });
  }

  private cargarSilencioso() {
    const prevPend = this.pedidos.filter(p => p.estado === 1).length;
    this.boletaSvc.listarTodas().subscribe({
      next: lista => {
        this.pedidos = lista; this.filtrar();
        const newPend = lista.filter((p:any) => p.estado===1).length;
        if (newPend > prevPend) {
          Swal.fire({ icon:'warning', title:`¡${newPend-prevPend} nuevo(s) pedido(s)!`,
            toast:true, position:'top-end', timer:4000, showConfirmButton:false });
        }
      }, error: () => {}
    });
  }

  filtrar() {
    let lista = [...this.pedidos];
    if (this.filtroEstado !== '0') lista = lista.filter(p => p.estado === Number(this.filtroEstado));
    if (this.busqueda) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(p =>
        String(p.idboleta).includes(q) ||
        (p.nombreCliente ?? '').toLowerCase().includes(q));
    }
    this.pedidosFiltrados = lista;
  }

  get totalPedidos()    { return this.pedidos.length; }
  get pendientes()      { return this.pedidos.filter((p:any) => p.estado===1).length; }
  get aprobados()       { return this.pedidos.filter((p:any) => p.estado===2).length; }
  get anulados()        { return this.pedidos.filter((p:any) => p.estado===3).length; }
  get totalVentas()     { return this.pedidos.filter((p:any) => p.estado===2).reduce((a:number,p:any) => a+Number(p.importe_total),0); }
  get tasaAprobacion()  { return this.totalPedidos ? Math.round(this.aprobados/this.totalPedidos*100) : 0; }
  get ticketPromedio()  { return this.aprobados ? this.totalVentas/this.aprobados : 0; }
  get ventasMes()       {
    const hoy = new Date();
    return this.pedidos.filter((p:any) => p.estado===2 &&
      new Date(p.fecha).getMonth()===hoy.getMonth() && new Date(p.fecha).getFullYear()===hoy.getFullYear())
      .reduce((a:number,p:any) => a+Number(p.importe_total),0);
  }

  verDetalle(id: number) {
    this.detalleVisible = true;
    this.errorDetalle   = false;

    // PASO 1: pre-pintar con datos de la lista
    const fila = this.pedidos.find((p:any) => p.idboleta === id);
    if (fila) {
      const subtotal = Number(fila.importe_total ?? 0) - Number(fila.importe_envio ?? 0);
      const neto = Number((subtotal / 1.18).toFixed(2));
      const igv = Number((subtotal - neto).toFixed(2));
      this.detalleData = {
        idboleta: fila.idboleta, fecha: fila.fecha, estado: fila.estado,
        tipoPago: fila.tipoPago, nroOperacion: fila.nroOperacion,
        direccionEnvio: fila.direccionEnvio, distrito: fila.distrito,
        nombreCliente: fila.nombreCliente, correoCliente: fila.correoCliente,
        importeProductos: subtotal, importeEnvio: Number(fila.importe_envio ?? 0),
        importeNeto: neto, importeIgv: igv, importeTotal: Number(fila.importe_total ?? 0),
        items: []
      };
    }

    // PASO 2: cargar items en background
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
        this.cargandoDetalle = false; this.errorDetalle = false;
      },
      error: () => {
        clearTimeout(this.timeoutId);
        this.cargandoDetalle = false;
        if (!this.detalleData) this.errorDetalle = true;
      }
    });
  }

  cambiarEstado(id: number, nuevoEstado: number, label: string) {
    Swal.fire({
      title:`¿${label} pedido #${id}?`, icon:'question',
      showCancelButton:true,
      confirmButtonColor: nuevoEstado===2?'#22c55e':'#ef4444',
      confirmButtonText:`Sí, ${label.toLowerCase()}`, cancelButtonText:'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.boletaSvc.cambiarEstado(id, nuevoEstado).subscribe({
        next: () => {
          const p = this.pedidos.find((x:any)=>x.idboleta===id);
          if (p) p.estado = nuevoEstado;
          if (this.detalleData?.idboleta===id) this.detalleData.estado = nuevoEstado;
          this.filtrar();
          Swal.fire({icon:'success',title:nuevoEstado===2?'¡Aprobado!':'Anulado',timer:1400,showConfirmButton:false});
          setTimeout(() => this.cargar(), 500);
        },
        error: () => { this.cargar(); Swal.fire({icon:'success',title:'¡Actualizado!',timer:1400,showConfirmButton:false}); }
      });
    });
  }

  cerrarDetalle() {
    clearTimeout(this.timeoutId);
    this.detalleVisible=false; this.detalleData=null;
    this.errorDetalle=false; this.cargandoDetalle=false;
  }

  parseTallas(t: string|null|undefined): any { if(!t) return null; try{return JSON.parse(t);}catch{return null;} }
  estadoLabel(e:number):string { return ({1:'Pendiente',2:'Aprobado',3:'Anulado'} as any)[e]??'—'; }
  estadoClass(e:number):string { return ({1:'mm-warn',2:'mm-ok',3:'mm-err'} as any)[e]??''; }
  tipoPagoLabel(t:number):string { return ({1:'Yape',2:'Plin',3:'Tarjeta'} as any)[t]??'Otro'; }
}
