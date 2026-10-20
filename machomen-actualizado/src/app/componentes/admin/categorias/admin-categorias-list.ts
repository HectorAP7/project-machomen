import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../services/producto';
import { Categoria } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-categorias-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-categorias-list.html'
})
export class AdminCategoriasList implements OnInit {
  categorias: Categoria[] = [];
  cargando = true;

  constructor(private svc: ProductoService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.svc.listarCategoriasAdmin().subscribe({
      next: data => {
        this.categorias = data.sort((a, b) => b.idcategoria - a.idcategoria);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }
}
