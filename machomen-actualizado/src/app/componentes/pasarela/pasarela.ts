import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { DistritoService } from '../../services/distrito';
import { Distrito } from '../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pasarela',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pasarela.html'
})
export class Pasarela implements OnInit {
  tipoPago   = '1';
  totalPagar = 0;
  procesando = false;
  necesitaDireccion = false;
  distritos: Distrito[] = [];
  itemsResumen: any[] = [];

  datos = {
    nroOperacion: '',
    titular:      '',
    tarjeta:      '',
    mes:          '',
    cvv:          '',
    direccion:    '',
    iddistrito:   0
  };

  // QR simulado Yape (25 celdas 5x5)
  qrCells     = [1,1,0,1,1, 1,0,1,0,1, 0,1,1,1,0, 1,0,1,0,1, 1,1,0,1,1];
  qrCellsPlin = [1,0,1,0,1, 0,1,1,1,0, 1,1,0,1,1, 0,1,0,1,0, 1,0,1,0,1];

  constructor(
    private carritoSvc:  CarritoService,
    private auth:        AuthService,
    private router:      Router,
    private distritoSvc: DistritoService
  ) {}

  ngOnInit() {
    const totales = this.carritoSvc.calcularTotales();
    this.totalPagar = totales.total;
    this.itemsResumen = this.carritoSvc.getItems();
    if (this.totalPagar === 0) { this.router.navigate(['/catalogo']); return; }

    const u = this.auth.usuario;
    if (u) {
      this.datos.direccion  = u.direccion ?? '';
      this.datos.iddistrito = u.iddistrito ?? 0;
      this.necesitaDireccion = !u.direccion || !u.iddistrito || u.iddistrito === 0;
    }
    this.distritoSvc.listar().subscribe({ next: d => this.distritos = d, error: () => {} });
  }

  pagar() {
    if (!this.datos.direccion?.trim()) {
      Swal.fire('Atención', 'Por favor ingresa tu dirección de envío.', 'warning'); return;
    }
    if (!this.datos.iddistrito || this.datos.iddistrito === 0) {
      Swal.fire('Atención', 'Por favor selecciona tu distrito.', 'warning'); return;
    }
    // Yape=1, Plin=2 requieren nroOperacion
    if ((this.tipoPago === '1' || this.tipoPago === '2') && !this.datos.nroOperacion?.trim()) {
      Swal.fire('Atención', 'Ingresa el N° de Operación de tu pago.', 'warning'); return;
    }
    // Tarjeta=3
    if (this.tipoPago === '3') {
      if (!this.datos.titular?.trim() || !this.datos.tarjeta?.trim() || !this.datos.cvv?.trim()) {
        Swal.fire('Atención', 'Completa todos los datos de la tarjeta.', 'warning'); return;
      }
    }

    this.procesando = true;
    this.carritoSvc.confirmarPedido({
      metodo:       Number(this.tipoPago),
      nroOperacion: this.datos.nroOperacion || (this.tipoPago === '3' ? 'TARJETA' : ''),
      iddistrito:   Number(this.datos.iddistrito),
      direccion:    this.datos.direccion
    }, () => {
      // Callback de error: liberar botón
      this.procesando = false;
    });
  }

  get totales() { return this.carritoSvc.calcularTotales(); }
}
