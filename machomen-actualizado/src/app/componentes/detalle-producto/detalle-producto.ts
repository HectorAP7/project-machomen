import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { CarritoService, CarritoItem } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { Producto } from '../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detalle-producto.html'
})
export class DetalleProducto implements OnInit {
  producto: Producto | null = null;

  // Zoom + lightbox
  zoomActivo = false;
  zoomOrigin = 'center center';
  lightboxAbierto = false;
  cantidad  = 1;
  cargando  = true;
  errorCarga = false;
  tallasCasaca: string[] = [];
  tallasZapato: number[] = [];
  tallaSeleccionada: string | number | null = null;
  private productoId = 0;

  get tieneTallas(): boolean { return this.tallasCasaca.length > 0 || this.tallasZapato.length > 0; }

  get lineasCaracteristicas(): string[] {
    if (!this.producto?.caracteristicas) return [];
    return this.producto.caracteristicas.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private productoSvc: ProductoService,
    private carritoSvc:  CarritoService,
    public  auth:        AuthService,
    private cd:          ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar() {
    this.cargando   = true;
    this.errorCarga = false;
    this.productoSvc.obtenerProducto(this.productoId).subscribe({
      next: data => {
        this.producto     = data;
        this.tallasCasaca = data.tallasConfig?.casaca ?? [];
        this.tallasZapato = (data.tallasConfig?.zapato ?? []) as number[];
        this.cargando     = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.cargando   = false;
        this.errorCarga = true;
      }
    });
  }

  decrementar() { if (this.cantidad > 1) this.cantidad--; }
  incrementar() { if (this.producto && this.cantidad < this.producto.stock) this.cantidad++; }

  seleccionarTalla(t: string | number) {
    this.tallaSeleccionada = this.tallaSeleccionada === t ? null : t;
  }

  agregar() {
    if (!this.producto) return;
    if (!this.auth.isAuthenticated) {
      Swal.fire({
        icon: 'info', title: '¡Inicia sesión!',
        text: 'Debes tener una cuenta para agregar productos al carrito.',
        confirmButtonText: 'Iniciar sesión',
        showCancelButton: true, cancelButtonText: 'Cancelar',
        confirmButtonColor: '#111'
      }).then(r => { if (r.isConfirmed) this.router.navigate(['/login']); });
      return;
    }
    if (this.tieneTallas && !this.tallaSeleccionada) {
      Swal.fire('Selecciona una talla', 'Por favor elige una talla antes de agregar al carrito.', 'warning');
      return;
    }
    const cantActual = this.carritoSvc.getItems()
      .filter((i: CarritoItem) => i.idproducto === this.producto!.idproducto)
      .reduce((sum, i) => sum + i.cantidad, 0);
    if (cantActual + this.cantidad > this.producto.stock) {
      Swal.fire('Sin stock', `Solo quedan ${this.producto.stock} unidades. Ya tienes ${cantActual} en el carrito.`, 'warning');
      return;
    }
    for (let i = 0; i < this.cantidad; i++) {
      this.carritoSvc.addToCart(this.producto, this.tallaSeleccionada);
    }
    Swal.fire({
      icon: 'success', title: '¡Agregado!',
      text: `${this.producto.descripcion} fue añadido a tu bolsa${this.tallaSeleccionada ? ' (Talla: ' + this.tallaSeleccionada + ')' : ''}.`,
      timer: 1800, showConfirmButton: false, position: 'top-end', toast: true
    });
  }

  /** Mueve el punto de zoom según la posición del cursor sobre la imagen */
  onZoomMove(ev: MouseEvent) {
    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 100;
    const y = ((ev.clientY - r.top) / r.height) * 100;
    this.zoomOrigin = `${x}% ${y}%`;
  }

  abrirLightbox() { this.lightboxAbierto = true; }
}
