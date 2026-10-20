import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CarritoService, CarritoItem } from '../../services/carrito';
import { CuponService } from '../../services/cupon';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit, OnDestroy {
  items:  CarritoItem[] = [];
  totales = { subtotal:0, envio:0, descuento:0, neto:0, igv:0, total:0 };
  private sub?: Subscription;

  // Cupon
  codigoCupon = '';
  cuponMensaje = '';
  cuponOk = false;
  validandoCupon = false;

  constructor(
    public carritoSvc: CarritoService,
    private cuponSvc: CuponService,
    public auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = this.carritoSvc.cart$.subscribe(items => {
      this.items  = items;
      this.totales = this.carritoSvc.calcularTotales();
      if (this.carritoSvc.cuponAplicado) {
        this.codigoCupon = this.carritoSvc.cuponAplicado.codigo;
        this.cuponOk = true;
      }
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  get totalItems(): number { return this.carritoSvc.totalItems; }

  decrementar(item: CarritoItem) { this.carritoSvc.updateQuantity(item.idproducto, -1, item.talla); }
  incrementar(item: CarritoItem) { this.carritoSvc.updateQuantity(item.idproducto, +1, item.talla); }
  eliminar(item: CarritoItem)    { this.carritoSvc.removeItem(item.idproducto, item.talla); }
  limpiar() { this.carritoSvc.clear(); this.quitarCupon(); }

  aplicarCupon() {
    const codigo = this.codigoCupon.trim();
    if (!codigo) { this.cuponMensaje = 'Ingresa un codigo.'; this.cuponOk = false; return; }
    this.validandoCupon = true;
    this.cuponMensaje = '';

    this.cuponSvc.validar(codigo, this.totales.subtotal).subscribe({
      next: res => {
        this.validandoCupon = false;
        if (res.valido) {
          this.carritoSvc.aplicarCupon({ codigo: res.codigo!, tipo: res.tipo!, valor: res.valor! });
          this.cuponOk = true;
          this.cuponMensaje = res.mensaje;
        } else {
          this.carritoSvc.aplicarCupon(null);
          this.cuponOk = false;
          this.cuponMensaje = res.mensaje;
        }
        this.totales = this.carritoSvc.calcularTotales();
        this.cd.detectChanges();
      },
      error: () => {
        this.validandoCupon = false;
        this.cuponOk = false;
        this.cuponMensaje = 'No se pudo validar el cupon. Intenta de nuevo.';
        this.cd.detectChanges();
      }
    });
  }

  quitarCupon() {
    this.carritoSvc.aplicarCupon(null);
    this.codigoCupon = '';
    this.cuponOk = false;
    this.cuponMensaje = '';
    this.totales = this.carritoSvc.calcularTotales();
    this.cd.detectChanges();
  }
}
