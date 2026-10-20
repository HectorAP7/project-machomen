import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, timeout, retry, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, Categoria } from '../models/tienda.models';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  readonly BASE = `${environment.apiGateway}/api`;

  // Timeouts más cortos: 8s para listas, 6s para uno solo
  private readonly TIMEOUT_LISTA = 8000;
  private readonly TIMEOUT_UNO   = 6000;

  // Caché en memoria — evita re-llamar al backend cuando vuelves a la misma pantalla
  private _cacheProductos$?: Observable<Producto[]>;
  private _cacheCategorias$?: Observable<Categoria[]>;

  constructor(readonly http: HttpClient) {}

  // ── Invalidar caché (llamar después de crear/editar/borrar producto) ───────
  invalidarCache() {
    this._cacheProductos$ = undefined;
    this._cacheCategorias$ = undefined;
  }

  // ── Listar todos (con caché shareReplay) ───────────────────────────────────
  listarTodos(): Observable<Producto[]> {
    if (!this._cacheProductos$) {
      this._cacheProductos$ = this.http.get<Producto[]>(`${this.BASE}/productos`).pipe(
        timeout(this.TIMEOUT_LISTA),
        retry({ count: 2, delay: 1000 }),
        map(lista => lista.map(p => this.parsear(p))),
        catchError(() => of([])),
        shareReplay(1)   // ← comparte el resultado entre todos los suscriptores
      );
    }
    return this._cacheProductos$;
  }

  // ── Para el catálogo (filtra localmente desde caché) ─────────────────────
  listarProductos(nombre = '', idcategoria = 0): Observable<Producto[]> {
    // Si no hay filtros, usar caché directa
    if (!nombre && idcategoria === 0) {
      return this.listarTodos();
    }
    // Con filtros: pasar por backend (ya rápido porque es una sola llamada)
    let params = new HttpParams();
    if (nombre)      params = params.set('nombre', nombre);
    if (idcategoria) params = params.set('idcategoria', idcategoria);
    return this.http.get<Producto[]>(`${this.BASE}/productos`, { params }).pipe(
      timeout(this.TIMEOUT_LISTA),
      retry({ count: 1, delay: 800 }),
      map(lista => lista.map(p => this.parsear(p))),
      catchError(() => of([]))
    );
  }

  // ── Un producto por id ────────────────────────────────────────────────────
  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.BASE}/productos/${id}`).pipe(
      timeout(this.TIMEOUT_UNO),
      retry({ count: 2, delay: 800 }),
      map(p => this.parsear(p))
    );
  }

  // ── Parse: normaliza talla_json / tallaJson (backend manda camelCase) ─────
  private parsear(p: Producto): Producto {
    if (!p.idcategoria && p.categoria?.idcategoria)
      p.idcategoria = p.categoria.idcategoria;

    // El backend Java serializa como "tallaJson" (camelCase)
    // pero el modelo Angular espera "talla_json" (snake_case) — soportar ambos
    const raw = p.talla_json ?? (p as any).tallaJson ?? null;
    if (raw) {
      try { p.tallasConfig = JSON.parse(raw); } catch {}
      p.talla_json = raw; // normalizar para el resto del código
    }
    return p;
  }

  // ── Categorías (con caché) ────────────────────────────────────────────────
  listarCategorias(): Observable<Categoria[]> {
    return this.listarCategoriasAdmin();
  }

  listarCategoriasAdmin(): Observable<Categoria[]> {
    if (!this._cacheCategorias$) {
      this._cacheCategorias$ = this.http.get<Categoria[]>(`${this.BASE}/categorias/admin`).pipe(
        timeout(this.TIMEOUT_LISTA),
        retry({ count: 2, delay: 800 }),
        catchError(() =>
          this.http.get<Categoria[]>(`${this.BASE}/categorias`).pipe(
            catchError(() => of([]))
          )
        ),
        shareReplay(1)
      );
    }
    return this._cacheCategorias$;
  }

  obtenerCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.BASE}/categorias/${id}`);
  }

  registrarCategoria(cat: Partial<Categoria>): Observable<Categoria> {
    const { idcategoria, ...data } = cat as any;
    return this.http.post<Categoria>(`${this.BASE}/categorias`, { ...data, estado: 1 }).pipe(
      map(r => { this.invalidarCache(); return r; })
    );
  }

  actualizarCategoria(cat: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.BASE}/categorias`, cat).pipe(
      map(r => { this.invalidarCache(); return r; })
    );
  }

  registrar(p: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.BASE}/productos`, this.buildPayload(p)).pipe(
      map(r => { this.invalidarCache(); return r; })
    );
  }

  actualizar(p: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.BASE}/productos/${p.idproducto}`, this.buildPayload(p)).pipe(
      map(r => { this.invalidarCache(); return r; })
    );
  }

  private buildPayload(p: Producto) {
    return {
      idproducto:      p.idproducto,
      descripcion:     p.descripcion,
      precio:          Number(p.precio),
      stock:           Number(p.stock),
      imagen:          p.imagen,
      estado:          p.estado ?? 1,
      talla_json:      p.talla_json ?? null,
      caracteristicas: p.caracteristicas ?? null,
      categoria:       { idcategoria: Number(p.idcategoria) }
    };
  }

  cambiarEstado(id: number, activo: boolean): Observable<any> {
    return this.http.post(`${this.BASE}/productos/cambiar-estado`, { id, activo }).pipe(
      map(r => { this.invalidarCache(); return r; })
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.BASE}/productos/${id}`).pipe(
      map(r => { this.invalidarCache(); return r; })
    );
  }
}
