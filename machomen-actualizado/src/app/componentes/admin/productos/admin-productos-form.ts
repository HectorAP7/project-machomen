import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../../services/producto';
import { Producto, Categoria } from '../../../models/tienda.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-productos-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-productos-form.html'
})
export class AdminProductosForm implements OnInit {
  producto: Producto = {
    idproducto: 0, descripcion: '', precio: 0, stock: 0,
    imagen: '', idcategoria: 0, estado: 1,
    caracteristicas: '', talla_json: ''
  };
  categorias: Categoria[] = [];
  isEdit  = false;
  titulo  = 'Nuevo Producto';
  cargando = false;
  guardando = false;

  tallasCasaca = ['S','M','L','XL'];
  tallasZapato = [35,36,37,38,39,40,41,42,43,44,45];
  selectedTallasCasaca: string[] = [];
  selectedTallasZapato: number[] = [];

  // Detectar por nombre de categoría (flexible)
  get categoriaSeleccionada(): string {
    const id = Number(this.producto.idcategoria);
    const cat = this.categorias.find(c => c.idcategoria === id);
    return (cat?.descripcion ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Detecta si la categoría es de casacas (ropa con talla S/M/L/XL)
  get esCasaca(): boolean {
    const n = this.categoriaSeleccionada;
    return n.includes('casaca') || n.includes('chaqueta') || n.includes('polo') ||
           n.includes('camisa') || n.includes('ropa') || n.includes('prenda');
  }

  // Detecta si la categoría es de zapatos/calzado
  get esZapato(): boolean {
    const n = this.categoriaSeleccionada;
    return n.includes('zapato') || n.includes('calzado') || n.includes('zapatilla') ||
           n.includes('bota') || n.includes('sandal') || n.includes('shoe');
  }

  // Si no es ninguno conocido pero el usuario quiere tallas: mostrar ambos
  get mostrarTallas(): boolean { return this.esCasaca || this.esZapato; }

  constructor(
    private svc:    ProductoService,
    private route:  ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar categorias y producto EN PARALELO (no esperar uno tras otro)
    this.svc.listarCategoriasAdmin().subscribe({
      next: cats => { this.categorias = cats; },
      error: () => {}
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && Number(id) > 0) {
      this.isEdit = true;
      this.titulo = 'Editar Producto';
      this.cargarProducto(Number(id));
    }
  }

  cargarProducto(id: number) {
    this.cargando = true;
    // Timeout de seguridad: si en 15s no llegó, libera la UI
    const timeoutId = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        Swal.fire('Atención', 'El producto está tardando en cargar. Verifica que los servicios estén activos.', 'warning');
      }
    }, 15000);

    this.svc.obtenerProducto(id).subscribe({
      next: p => {
        clearTimeout(timeoutId);
        this.producto = { ...p, idcategoria: p.idcategoria || p.categoria?.idcategoria || 0 };
        // Parsear tallas
        const tallaJson = p.talla_json || '';
        if (p.tallasConfig) {
          this.selectedTallasCasaca = p.tallasConfig.casaca ?? [];
          this.selectedTallasZapato = p.tallasConfig.zapato ?? [];
        } else if (tallaJson) {
          try {
            const c = JSON.parse(tallaJson);
            this.selectedTallasCasaca = c.casaca ?? [];
            this.selectedTallasZapato = c.zapato ?? [];
          } catch {}
        }
        this.cargando = false;
      },
      error: () => {
        clearTimeout(timeoutId);
        this.cargando = false;
        Swal.fire('Error', 'No se pudo cargar el producto. Verifica que ms-productos esté activo.', 'error');
      }
    });
  }

  toggleTallaCasaca(t: string) {
    const i = this.selectedTallasCasaca.indexOf(t);
    if (i >= 0) this.selectedTallasCasaca.splice(i, 1);
    else this.selectedTallasCasaca.push(t);
  }

  toggleTallaZapato(t: number) {
    const i = this.selectedTallasZapato.indexOf(t);
    if (i >= 0) this.selectedTallasZapato.splice(i, 1);
    else this.selectedTallasZapato.push(t);
  }

  isTallaCasacaSelected(t: string): boolean { return this.selectedTallasCasaca.includes(t); }
  isTallaZapatoSelected(t: number): boolean { return this.selectedTallasZapato.includes(t); }

  seleccionarTodasCasaca() {
    this.selectedTallasCasaca = [...this.tallasCasaca];
  }
  seleccionarTodosZapato() {
    this.selectedTallasZapato = [...this.tallasZapato];
  }

  buildTallaJson(): string {
    const config: any = {};
    if (this.selectedTallasCasaca.length > 0) config.casaca = [...this.selectedTallasCasaca];
    if (this.selectedTallasZapato.length > 0) config.zapato = [...this.selectedTallasZapato].sort((a,b)=>a-b);
    return Object.keys(config).length > 0 ? JSON.stringify(config) : '';
  }

  guardar() {
    if (!this.producto.descripcion?.trim()) { Swal.fire('Atención', 'Escribe el nombre del producto.', 'warning'); return; }
    const idCat = Number(this.producto.idcategoria);
    if (!idCat) { Swal.fire('Atención', 'Selecciona una categoría.', 'warning'); return; }
    if (!this.producto.precio || this.producto.precio <= 0) { Swal.fire('Atención', 'El precio debe ser mayor a 0.', 'warning'); return; }

    this.producto.idcategoria = idCat;
    this.producto.talla_json = this.buildTallaJson();

    const op = this.isEdit ? this.svc.actualizar(this.producto) : this.svc.registrar(this.producto);
    this.guardando = true;
    op.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire({
          icon:'success',
          title: this.isEdit ? '¡Producto actualizado!' : '¡Producto registrado!',
          text: this.isEdit ? 'Los cambios fueron guardados correctamente.' : 'El nuevo producto se agregó al catálogo.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#111'
        }).then(() => this.router.navigate(['/admin/productos']));
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo guardar',
          text: err?.error?.message || 'Verifica los datos e inténtalo de nuevo.',
          confirmButtonColor: '#111'
        });
      }
    });
  }
}
