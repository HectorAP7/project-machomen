import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, CrearVendedorRequest } from '../models/tienda.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private readonly BASE = `${environment.apiGateway}/api/usuarios`;

  constructor(private http: HttpClient) {}

  // ── Perfil propio del usuario logueado ────────────────────────────────────
  getMiPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.BASE}/mi-perfil`);
  }
  updateMiPerfil(u: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.BASE}/mi-perfil`, u);
  }

  // ── Alias usados por el nuevo perfil.ts ───────────────────────────────────
  obtenerPerfil(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.BASE}/perfil/${id}`);
  }
  actualizarPerfil(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.BASE}/perfil/${id}`, datos);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  listarTodos():      Observable<Usuario[]> { return this.http.get<Usuario[]>(this.BASE); }
  listarVendedores(): Observable<Usuario[]> { return this.http.get<Usuario[]>(`${this.BASE}/vendedores`); }
  listarClientes():   Observable<Usuario[]> { return this.http.get<Usuario[]>(`${this.BASE}/clientes`); }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.BASE}/${id}`);
  }

  cambiarEstado(id: number, estado: number): Observable<any> {
    return this.http.put(`${this.BASE}/estado/${id}/${estado}`, {});
  }

  crearVendedor(data: CrearVendedorRequest | any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.BASE}/vendedor`, data);
  }

  registrar(data: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.BASE}/registrar`, data);
  }
}
