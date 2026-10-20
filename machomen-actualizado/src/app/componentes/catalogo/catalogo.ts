import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { CarritoService } from '../../services/carrito';
import { AuthService } from '../../services/auth';
import { Producto, Categoria } from '../../models/tienda.models';
import Swal from 'sweetalert2';

type Orden = 'nuevos' | 'precio-asc' | 'precio-desc' | 'nombre';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  todosLosProductos: Producto[] = [];
  productos:   Producto[]  = [];   // ya filtrados + ordenados (sin paginar)
  pagina:      Producto[]  = [];   // sólo la página actual
  categorias:  Categoria[] = [];

  categoriaId  = 0;
  busqueda     = '';
  orden: Orden = 'nuevos';
  precioMax    = 0;          // 0 = sin límite
  precioTope   = 1000;       // límite del slider (se calcula al cargar)
  tituloCat    = 'Todos los productos';
  cargando     = true;
  errorCarga   = false;

  // Paginación
  paginaActual = 1;
  porPagina    = 9;
  totalPaginas = 1;

  // Vista
  filtrosMovil = false;

  constructor(
    private productoSvc: ProductoService,
    private carritoSvc:  CarritoService,
    public  auth:        AuthService,
    private router:      Router,
    private route:       ActivatedRoute,
    private cd:          ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.categoriaId = p['cat'] ? Number(p['cat']) : this.categoriaId;
      if (p['q'] !== undefined) this.busqueda = p['q'] || '';
      if (this.todosLosProductos.length > 0) this.aplicarFiltros();
    });
    this.cargarCategorias();
    this.cargarTodosProductos();
  }

  cargarCategorias() {
    this.productoSvc.listarCategoriasAdmin().subscribe({
      next: cats => { this.categorias = cats; this.cd.detectChanges(); },
      error: () => {
        this.productoSvc.listarCategorias().subscribe({
          next: cats => { this.categorias = cats; this.cd.detectChanges(); },
          error: () => {}
        });
      }
    });
  }

  cargarTodosProductos() {
    this.cargando = true; this.errorCarga = false;
    this.productoSvc.listarProductos('', 0).subscribe({
      next: d => {
        this.todosLosProductos = d.filter(p => p.estado === 1)
                                  .sort((a, b) => b.idproducto - a.idproducto);
        const max = Math.max(0, ...this.todosLosProductos.map(p => p.precio || 0));
        this.precioTope = Math.ceil(max / 50) * 50 || 1000;
        this.aplicarFiltros();
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => { this.cargando = false; this.errorCarga = true; this.cd.detectChanges(); }
    });
  }

  aplicarFiltros(resetPagina = true) {
    let r = [...this.todosLosProductos];

    if (this.categoriaId > 0)
      r = r.filter(p => Number(p.idcategoria ?? p.categoria?.idcategoria) === Number(this.categoriaId));

    if (this.busqueda.trim()) {
      const t = this.busqueda.toLowerCase();
      r = r.filter(p => p.descripcion.toLowerCase().includes(t));
    }

    if (this.precioMax > 0)
      r = r.filter(p => (p.precio || 0) <= this.precioMax);

    switch (this.orden) {
      case 'precio-asc':  r.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': r.sort((a, b) => b.precio - a.precio); break;
      case 'nombre':      r.sort((a, b) => a.descripcion.localeCompare(b.descripcion)); break;
      default:            r.sort((a, b) => b.idproducto - a.idproducto);
    }

    this.productos = r;
    this.tituloCat = this.categoriaId === 0
      ? 'Todos los productos'
      : (this.categorias.find(c => c.idcategoria === this.categoriaId)?.descripcion ?? 'Categoría');

    if (resetPagina) this.paginaActual = 1;
    this.recalcularPagina();
    this.cd.detectChanges();
  }

  recalcularPagina() {
    this.totalPaginas = Math.max(1, Math.ceil(this.productos.length / this.porPagina));
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;
    const ini = (this.paginaActual - 1) * this.porPagina;
    this.pagina = this.productos.slice(ini, ini + this.porPagina);
  }

  irPagina(n: number) {
    if (n < 1 || n > this.totalPaginas) return;
    this.paginaActual = n;
    this.recalcularPagina();
    this.cd.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  seleccionarCategoria(id: number) {
    this.categoriaId = Number(id);
    this.aplicarFiltros();
  }

  buscar()           { this.aplicarFiltros(); }
  cambiarOrden()     { this.aplicarFiltros(false); }
  cambiarPrecio()    { this.aplicarFiltros(); }
  limpiarBusqueda()  { this.busqueda = ''; this.aplicarFiltros(); }

  limpiarFiltros() {
    this.categoriaId = 0; this.busqueda = ''; this.precioMax = 0; this.orden = 'nuevos';
    this.aplicarFiltros();
  }

  recargar() { this.cargarTodosProductos(); }
  toggleFiltros() { this.filtrosMovil = !this.filtrosMovil; }

  contarPorCategoria(id: number): number {
    return this.todosLosProductos.filter(p =>
      Number(p.idcategoria ?? p.categoria?.idcategoria) === Number(id)).length;
  }

  tallasDe(p: Producto): (string | number)[] {
    return (p.tallasConfig?.casaca as (string | number)[] | undefined)
        ?? (p.tallasConfig?.zapato as (string | number)[] | undefined)
        ?? [];
  }

  agregarAlCarrito(p: Producto) {
    if (!this.auth.isAuthenticated) {
      Swal.fire({
        icon: 'info', title: '¡Inicia sesión!',
        text: 'Necesitas una cuenta para añadir productos.',
        confirmButtonText: 'Iniciar sesión',
        showCancelButton: true, cancelButtonText: 'Cancelar',
        confirmButtonColor: '#111'
      }).then(r => { if (r.isConfirmed) this.router.navigate(['/login']); });
      return;
    }

    // Si el producto tiene tallas (casaca/zapato), NO se agrega directo:
    // se lleva al cliente a la página del producto para que elija la talla.
    if (this.tallasDe(p).length > 0) {
      Swal.fire({
        icon: 'info',
        title: 'Elige tu talla',
        text: 'Este producto requiere que selecciones una talla antes de comprar.',
        confirmButtonText: 'Ver producto y elegir talla',
        confirmButtonColor: '#111'
      }).then(() => this.router.navigate(['/producto', p.idproducto]));
      return;
    }

    const enCarrito = this.carritoSvc.getItems().find(i => i.idproducto === p.idproducto);
    if ((enCarrito?.cantidad ?? 0) >= p.stock) {
      Swal.fire('Sin stock', `Solo quedan ${p.stock} unidades.`, 'warning');
      return;
    }
    this.carritoSvc.addToCart(p);
    Swal.fire({ icon:'success', title:'¡Añadido!', text:`${p.descripcion} en tu bolsa.`,
      timer:1500, showConfirmButton:false, toast:true, position:'top-end' });
  }
}
