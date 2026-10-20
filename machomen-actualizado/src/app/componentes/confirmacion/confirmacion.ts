import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmacion.html'
})
export class Confirmacion implements OnInit {
  orden: any = null;
  fechaActual = '';
  nombreCliente = '';

  constructor(
    private carritoSvc: CarritoService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.orden = this.carritoSvc.ordenFinalizada;
    if (!this.orden) { this.router.navigate(['/catalogo']); return; }

    // Fecha actual formateada
    const now = new Date();
    this.fechaActual = now.toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // Nombre del cliente
    const u = this.auth.usuario;
    if (u) {
      this.nombreCliente = `${u.nombres} ${u.apellidos}`;
    }
  }

  get totales() { return this.orden?.totales; }
}
