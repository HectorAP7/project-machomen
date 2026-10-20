import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../../services/producto';
import { Categoria } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-categorias-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-categorias-form.html'
})
export class AdminCategoriasForm implements OnInit {
  categoria: Categoria = { idcategoria: 0, descripcion: '', estado: 1 };
  isEdit = false;
  titulo = 'Nueva Categoría';

  constructor(
    private svc:    ProductoService,
    private route:  ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.isEdit = true;
      this.titulo = 'Editar Categoría';
      this.svc.obtenerCategoria(id).subscribe({
        next: res => this.categoria = res,
        error: err => Swal.fire('Error', `Error ${err.status}: No se pudo cargar la categoría`, 'error')
      });
    }
  }

  guardar() {
    if (!this.categoria.descripcion.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio.', 'warning'); return;
    }
    const op = this.isEdit
      ? this.svc.actualizarCategoria(this.categoria)
      : this.svc.registrarCategoria(this.categoria);

    op.subscribe({
      next: () => { Swal.fire('¡Éxito!', 'Operación completada.', 'success'); this.router.navigate(['/admin/categorias']); },
      error: err => Swal.fire('Error', `Error ${err.status}`, 'error')
    });
  }
}
