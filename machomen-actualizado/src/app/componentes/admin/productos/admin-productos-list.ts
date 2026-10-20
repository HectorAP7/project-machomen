import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto';
import { Producto } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-productos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-productos-list.html'
})
export class AdminProductosList implements OnInit {
  productos:         Producto[] = [];
  productosFiltrados:Producto[] = [];
  cargando  = true;
  busqueda  = '';

  constructor(private svc: ProductoService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.svc.listarProductos().subscribe({
      next: d => { this.productos = d.sort((a,b) => b.idproducto - a.idproducto); this.filtrar(); this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase().trim();
    this.productosFiltrados = q
      ? this.productos.filter(p =>
          p.descripcion.toLowerCase().includes(q) ||
          (p.categoria?.descripcion ?? '').toLowerCase().includes(q))
      : [...this.productos];
  }

  cambiarEstado(id: number, activo: boolean) {
    const label = activo ? 'activar' : 'desactivar';
    Swal.fire({
      title: `¿${label.charAt(0).toUpperCase()+label.slice(1)} producto?`,
      icon: activo ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: activo ? '#198754' : '#dc3545',
      confirmButtonText: `Sí, ${label}`,
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.svc.cambiarEstado(id, activo).subscribe({
        next: () => {
          const p = this.productos.find(x => x.idproducto === id);
          if (p) p.estado = activo ? 1 : 0;
          this.filtrar();
          Swal.fire({
            icon: activo ? 'success' : 'info',
            title: activo ? 'Producto activado' : 'Producto desactivado',
            timer: 2000, showConfirmButton: false, toast: true, position: 'top-end'
          });
        },
        error: () => { Swal.fire('Error', 'No se pudo cambiar el estado.', 'error'); this.cargar(); }
      });
    });
  }

  eliminar(p: Producto) {
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `<strong>${p.descripcion}</strong><br><small class="text-muted">Esta acción no se puede deshacer.</small>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#212529', cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(r => {
      if (r.isConfirmed) {
        this.svc.eliminar(p.idproducto).subscribe({
          next: () => {
            this.productos = this.productos.filter(x => x.idproducto !== p.idproducto);
            this.filtrar();
            Swal.fire({ icon:'success', title:'Eliminado', timer:1500, showConfirmButton:false });
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  get totalActivos():  number { return this.productos.filter(p => p.estado===1).length; }
  get totalStockBajo():number { return this.productos.filter(p => p.stock<5 && p.estado===1).length; }
}
