import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {

  private readonly BASE = `${environment.apiGateway}/api`;
  private readonly TIMEOUT_MS = 30000; // 15 segundos máximo

  constructor(private http: HttpClient) {}

  listarPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/boletas/cliente/${idUsuario}`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => throwError(() => err))
    );
  }

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/boletas/listar`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => throwError(() => err))
    );
  }

  obtenerDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE}/boletas/detalle/${id}`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => throwError(() => err))
    );
  }

  cambiarEstado(id: number, estado: number): Observable<any> {
    return this.http.put<any>(`${this.BASE}/boletas/cambiar-estado/${id}/${estado}`, {}).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => throwError(() => err))
    );
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.BASE}/dashboard/resumen`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => throwError(() => err))
    );
  }

  /** Top productos más vendidos (datos reales de tb_boleta_det). */
  getTopProductos(limite: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/dashboard/top-productos?limite=${limite}`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(err => throwError(() => err))
    );
  }
}
