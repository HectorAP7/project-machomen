import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { Producto, Categoria } from '../../models/tienda.models';

interface CategoriaCard extends Categoria {
  img: string;
  tagline: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  categorias:          CategoriaCard[] = [];
  productosDestacados: Producto[]  = [];
  cargandoProductos    = true;

  /** Imágenes representativas por categoría (mismo CDN que los productos) */
  private imgsCategoria: Record<string, { img: string; tagline: string }> = {
    'casacas':    { img: 'https://corzo.pe/DSWI/img/prod/1.jpg',  tagline: 'Cuero genuino, corte impecable' },
    'zapatos':    { img: 'https://corzo.pe/DSWI/img/prod/6.jpg',  tagline: 'Elegancia en cada paso' },
    'billeteras': { img: 'https://corzo.pe/DSWI/img/prod/12.jpg', tagline: 'El detalle que te define' }
  };

  /** Galeria estilo lookbook: 6 productos representativos */
  galeriaImgs: string[] = [
    'https://corzo.pe/DSWI/img/prod/1.jpg',
    'https://corzo.pe/DSWI/img/prod/3.jpg',
    'https://corzo.pe/DSWI/img/prod/5.jpg',
    'https://corzo.pe/DSWI/img/prod/8.jpg',
    'https://corzo.pe/DSWI/img/prod/10.jpg',
    'https://corzo.pe/DSWI/img/prod/12.jpg'
  ];

  constructor(private productoSvc: ProductoService, private cd: ChangeDetectorRef) {}

  /** Devuelve las tallas de un producto (casaca o zapato) como arreglo */
  tallasDe(p: Producto): (string | number)[] {
    return (p.tallasConfig?.casaca as (string | number)[] | undefined)
        ?? (p.tallasConfig?.zapato as (string | number)[] | undefined)
        ?? [];
  }

  ngOnInit() {
    this.productoSvc.listarCategorias().subscribe({
      next: d => {
        this.categorias = d.slice(0, 3).map(c => {
          const key = (c.descripcion ?? '').toLowerCase().trim();
          const extra = this.imgsCategoria[key]
                     ?? { img: 'https://corzo.pe/DSWI/img/prod/3.jpg', tagline: 'Calidad premium' };
          return { ...c, ...extra };
        });
        this.cd.detectChanges();
      },
      error: () => {}
    });
    this.productoSvc.listarProductos().subscribe({
      next: d => {
        this.productosDestacados = d
          .filter(p => p.estado === 1)
          .sort((a, b) => b.idproducto - a.idproducto)
          .slice(0, 8);
        this.cargandoProductos = false;
        this.cd.detectChanges();
      },
      error: () => { this.cargandoProductos = false; this.cd.detectChanges(); }
    });
  }
}
