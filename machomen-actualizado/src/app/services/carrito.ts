import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

export interface CarritoItem {
  idproducto: number;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
  cantidad: number;
  talla?: string | number | null;
}

export interface DatosPago {
  metodo: number;
  nroOperacion: string;
  iddistrito: number;
  direccion: string;
}

export interface OrdenFinalizada {
  idboleta: number;
  items: CarritoItem[];
  totales: any;
  infoPago: DatosPago;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {

  private readonly API   = `${environment.apiGateway}/api/boletas/registrar`;
  private readonly STORE = 'machomen_carrito';

  private items: CarritoItem[] = [];
  private cartSubject = new BehaviorSubject<CarritoItem[]>([]);
  cart$ = this.cartSubject.asObservable();
  ordenFinalizada: OrdenFinalizada | null = null;

  constructor(
    private http:   HttpClient,
    private auth:   AuthService,
    private router: Router
  ) {
    this.cargarDesdeStorage();
  }

  private cargarDesdeStorage() {
    try {
      const raw = localStorage.getItem(this.STORE);
      if (raw) { this.items = JSON.parse(raw); this.emit(); }
    } catch { this.items = []; }
  }

  private guardarEnStorage() {
    try { localStorage.setItem(this.STORE, JSON.stringify(this.items)); } catch {}
  }

  getItems(): CarritoItem[] { return [...this.items]; }

  addToCart(producto: any, talla?: string | number | null) {
    const existing = this.items.find(i =>
      i.idproducto === producto.idproducto && i.talla === (talla ?? null)
    );
    if (existing) {
      if (existing.cantidad < producto.stock) existing.cantidad++;
    } else {
      this.items.push({
        idproducto:  producto.idproducto,
        descripcion: producto.descripcion,
        precio:      producto.precio,
        imagen:      producto.imagen ?? '',
        stock:       producto.stock,
        cantidad:    1,
        talla:       talla ?? null
      });
    }
    this.guardarEnStorage();
    this.emit();
  }

  updateQuantity(idproducto: number, delta: number, talla?: string | number | null) {
    const item = this.items.find(i => i.idproducto === idproducto && i.talla === (talla ?? null));
    if (!item) return;
    item.cantidad = Math.max(1, Math.min(item.stock, item.cantidad + delta));
    this.guardarEnStorage();
    this.emit();
  }

  removeItem(idproducto: number, talla?: string | number | null) {
    this.items = this.items.filter(i => !(i.idproducto === idproducto && i.talla === (talla ?? null)));
    this.guardarEnStorage();
    this.emit();
  }

  clear() {
    this.items = [];
    localStorage.removeItem(this.STORE);
    this.emit();
  }

  // ── Cupón de descuento aplicado (en memoria) ──
  cuponAplicado: { codigo: string; tipo: number; valor: number; descripcion?: string } | null = null;

  get totalItems(): number { return this.items.reduce((s, i) => s + i.cantidad, 0); }

  /**
   * Cálculo CORRECTO de totales (estándar peruano):
   * - El precio de venta YA incluye IGV (18%).
   * - El IGV se desglosa hacia adentro: neto = subtotal / 1.18, igv = subtotal - neto.
   * - El total NO suma el IGV por fuera; total = subtotal + envío - descuento.
   */
  calcularTotales() {
    const subtotal = this.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const envio    = subtotal >= 250 ? 0 : (subtotal > 0 ? 10 : 0);

    // Descuento por cupón (tipo 1 = porcentaje, tipo 2 = monto fijo)
    let descuento = 0;
    if (this.cuponAplicado) {
      if (this.cuponAplicado.tipo === 1) {
        descuento = Math.round(subtotal * (this.cuponAplicado.valor / 100) * 100) / 100;
      } else {
        descuento = this.cuponAplicado.valor;
      }
      descuento = Math.min(descuento, subtotal); // nunca más que el subtotal
    }

    const baseConDescuento = Math.max(0, subtotal - descuento);
    // IGV incluido: se extrae del monto con descuento
    const neto  = Math.round((baseConDescuento / 1.18) * 100) / 100;
    const igv   = Math.round((baseConDescuento - neto) * 100) / 100;
    const total = Math.round((baseConDescuento + envio) * 100) / 100;

    return { subtotal, envio, descuento, neto, igv, total };
  }

  /** Guarda/limpia el cupón aplicado y refresca la vista */
  aplicarCupon(cupon: { codigo: string; tipo: number; valor: number; descripcion?: string } | null) {
    this.cuponAplicado = cupon;
    this.emit();
  }

  confirmarPedido(datosPago: DatosPago, onError?: () => void) {
    const totales = this.calcularTotales();
    const request = {
      idUsuario:    this.auth.usuario?.idusuario ?? 0,
      idDistrito:   datosPago.iddistrito ?? 1,
      direccion:    datosPago.direccion,
      tipoPago:     Number(datosPago.metodo),
      nroOperacion: datosPago.nroOperacion ?? '',
      subtotal:     totales.subtotal,
      envio:        totales.envio,
      descuento:    totales.descuento,
      cupon:        this.cuponAplicado?.codigo ?? null,
      total:        totales.total,
      items: this.items.map(i => ({
        idProducto: i.idproducto,
        cantidad:   i.cantidad,
        precio:     i.precio,
        talla:      i.talla ?? null
      }))
    };

    this.http.post<any>(this.API, request).subscribe({
      next: res => {
        if (res && res.success) {
          this.ordenFinalizada = { idboleta: res.idBoleta, items: [...this.items], totales, infoPago: datosPago };
          this.cuponAplicado = null;   // limpiar cupón tras compra exitosa
          this.clear();
          this.router.navigate(['/confirmacion']);
        } else {
          const msg = res?.mensaje || 'No se pudo registrar el pedido.';
          Swal.fire('Error al pagar', msg, 'error');
          if (onError) onError();
        }
      },
      error: err => {
        console.error('Error boleta:', err);
        const msg = err?.error?.mensaje || err?.error?.message || 'Error de conexión con el servidor. Verifica que los servicios estén activos.';
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar pago',
          text: msg,
          confirmButtonColor: '#111'
        });
        if (onError) onError();
      }
    });
  }

  private emit() { this.cartSubject.next([...this.items]); }
}
