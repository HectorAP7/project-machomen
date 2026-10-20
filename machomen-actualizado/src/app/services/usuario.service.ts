import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, retry, catchError, throwError, shareReplay, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, CrearVendedorRequest } from '../models/tienda.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private readonly BASE = `${environment.apiGateway}/api/usuarios`;
  private readonly T = 8000;  // timeout 8s

  // Caché de listas
  private _cacheVendedores$?: Observable<Usuario[]>;
  private _cacheClientes$?: Observable<Usuario[]>;
  private _cacheTodos$?: Observable<Usuario[]>;

  constructor(private http: HttpClient) {}

  invalidarCache() {
    this._cacheVendedores$ = undefined;
    this._cacheClientes$   = undefined;
    this._cacheTodos$      = undefined;
  }

  getMiPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.BASE}/mi-perfil`).pipe(
      timeout(this.T), retry({ count: 2, delay: 800 })
    );
  }

  updateMiPerfil(u: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.BASE}/mi-perfil`, u).pipe(timeout(this.T));
  }

  obtenerPerfil(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.BASE}/perfil/${id}`).pipe(
      timeout(this.T), retry({ count: 2, delay: 800 })
    );
  }

  actualizarPerfil(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.BASE}/perfil/${id}`, datos).pipe(timeout(this.T));
  }

  listarTodos(): Observable<Usuario[]> {
    if (!this._cacheTodos$) {
      this._cacheTodos$ = this.http.get<Usuario[]>(this.BASE).pipe(
        timeout(this.T), retry({ count: 2, delay: 1000 }),
        shareReplay(1)
      );
    }
    return this._cacheTodos$;
  }

  listarVendedores(): Observable<Usuario[]> {
    if (!this._cacheVendedores$) {
      this._cacheVendedores$ = this.http.get<Usuario[]>(`${this.BASE}/vendedores`).pipe(
        timeout(this.T), retry({ count: 2, delay: 1000 }),
        shareReplay(1)
      );
    }
    return this._cacheVendedores$;
  }

  listarClientes(): Observable<Usuario[]> {
    if (!this._cacheClientes$) {
      this._cacheClientes$ = this.http.get<Usuario[]>(`${this.BASE}/clientes`).pipe(
        timeout(this.T), retry({ count: 2, delay: 1000 }),
        shareReplay(1)
      );
    }
    return this._cacheClientes$;
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.BASE}/${id}`).pipe(
      timeout(this.T), retry({ count: 1, delay: 800 })
    );
  }

  cambiarEstado(id: number, estado: number): Observable<any> {
    return this.http.put(`${this.BASE}/estado/${id}/${estado}`, {}).pipe(
      timeout(this.T),
      map(r => { this.invalidarCache(); return r; })
    );
  }

  crearVendedor(data: CrearVendedorRequest | any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.BASE}/vendedor`, data).pipe(
      timeout(this.T),
      map(r => { this.invalidarCache(); return r; })
    );
  }

  registrar(data: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.BASE}/registrar`, data).pipe(
      timeout(this.T),
      map(r => { this.invalidarCache(); return r; })
    );
  }
}
