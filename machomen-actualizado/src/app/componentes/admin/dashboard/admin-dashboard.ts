import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoletaService } from '../../../services/boleta';
import { ProductoService } from '../../../services/producto';

declare const Chart: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chartVentas') chartVentasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartPagos')  chartPagosRef?:  ElementRef<HTMLCanvasElement>;
  @ViewChild('chartTop')    chartTopRef?:    ElementRef<HTMLCanvasElement>;

  stats = { totalUsuarios: 0, totalProductos: 0, totalBoletas: 0, gananciasTotales: 0 };
  ultimosPedidos: any[] = [];
  cargando        = true;
  cargandoPedidos = true;

  /** Todas las boletas para los gráficos */
  private todasBoletas: any[] = [];
  private chartVentas: any;
  private chartPagos:  any;
  private chartTop:    any;

  constructor(
    private boletaSvc: BoletaService,
    private productoSvc: ProductoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.boletaSvc.getDashboard().subscribe({
      next: d => { this.stats = d; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
    this.boletaSvc.listarTodas().subscribe({
      next: lista => {
        this.todasBoletas = lista;
        this.ultimosPedidos = lista.slice(0, 8);
        this.cargandoPedidos = false;
        // Pintar gráficos cuando lleguen los datos
        setTimeout(() => this.pintarGraficos(), 200);
      },
      error: () => { this.cargandoPedidos = false; }
    });
  }

  ngAfterViewInit() {
    if (this.todasBoletas.length > 0) setTimeout(() => this.pintarGraficos(), 200);
  }

  ngOnDestroy() {
    this.chartVentas?.destroy();
    this.chartPagos?.destroy();
    this.chartTop?.destroy();
  }

  // ════════════ GRÁFICOS ════════════
  private pintarGraficos() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js no está cargado todavía');
      return;
    }
    this.pintarVentasPorMes();
    this.pintarMetodosPago();
    this.pintarProductosTop();
  }

  /** Gráfico 1: Ventas (S/) por mes — últimos 6 meses */
  private pintarVentasPorMes() {
    if (!this.chartVentasRef) return;
    const hoy = new Date();
    const meses: string[] = [];
    const valores: number[] = [];
    const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push(`${nombres[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`);
      const total = this.todasBoletas
        .filter((b:any) => b.estado === 2 && b.fecha)
        .filter((b:any) => {
          const f = new Date(b.fecha);
          return f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear();
        })
        .reduce((a:number, b:any) => a + Number(b.importe_total ?? 0), 0);
      valores.push(Math.round(total * 100) / 100);
    }

    this.chartVentas?.destroy();
    this.chartVentas = new Chart(this.chartVentasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Ventas (S/)',
          data: valores,
          backgroundColor: 'rgba(201,168,76,.85)',
          borderColor: '#c9a84c',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v:any) => 'S/ ' + v } }
        }
      }
    });
  }

  /** Gráfico 2: Métodos de pago (donut) */
  private pintarMetodosPago() {
    if (!this.chartPagosRef) return;
    const aprobadas = this.todasBoletas.filter((b:any) => b.estado === 2);
    const yape    = aprobadas.filter((b:any) => b.tipoPago === 1).length;
    const plin    = aprobadas.filter((b:any) => b.tipoPago === 2).length;
    const tarjeta = aprobadas.filter((b:any) => b.tipoPago === 3).length;

    this.chartPagos?.destroy();
    this.chartPagos = new Chart(this.chartPagosRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Yape', 'Plin', 'Tarjeta'],
        datasets: [{
          data: [yape, plin, tarjeta],
          backgroundColor: ['#c9a84c', '#1a1a1a', '#a8893a'],
          borderColor: '#fff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } }
        },
        cutout: '60%'
      }
    });
  }

  /** Gráfico 3: Top productos vendidos — datos REALES desde tb_boleta_det */
  private pintarProductosTop() {
    if (!this.chartTopRef) return;

    this.boletaSvc.getTopProductos(5).subscribe({
      next: top => {
        // top = [{ idproducto, descripcion, vendidos }]
        if (!top || top.length === 0) {
          // Sin ventas aún: mostrar mensaje vacío en el canvas
          this.chartTop?.destroy();
          return;
        }
        const labels = top.map(p => p.descripcion?.length > 22
          ? p.descripcion.substring(0, 20) + '...' : (p.descripcion || 'Producto'));
        const data = top.map(p => Number(p.vendidos) || 0);

        this.chartTop?.destroy();
        this.chartTop = new Chart(this.chartTopRef!.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Unidades vendidas',
              data,
              backgroundColor: 'rgba(201,168,76,.85)',
              borderColor: '#c9a84c',
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      },
      error: () => {
        // Fallback: si el endpoint falla, dejar el canvas vacío sin romper la vista
        console.warn('No se pudo cargar top-productos');
      }
    });
  }
}
