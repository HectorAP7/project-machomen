import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, throwError, retry, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoletaService {

  private readonly BASE = `${environment.apiGateway}/api`;
  private readonly T_LISTA   = 10000;   // 10s para listas
  private readonly T_DETALLE =  8000;   // 8s para detalle
  private readonly T_ACCION  =  8000;   // 8s para cambios de estado

  // Caché de listas admin (se invalida al cambiar estado)
  private _cacheTodas$?: Observable<any[]>;

  constructor(private http: HttpClient) {}

  invalidarCache() { this._cacheTodas$ = undefined; }

  listarPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/boletas/cliente/${idUsuario}`).pipe(
      timeout(this.T_LISTA),
      retry({ count: 2, delay: 1000 }),
      catchError(err => throwError(() => err))
    );
  }

  listarTodas(): Observable<any[]> {
    if (!this._cacheTodas$) {
      this._cacheTodas$ = this.http.get<any[]>(`${this.BASE}/boletas/listar`).pipe(
        timeout(this.T_LISTA),
        retry({ count: 2, delay: 1000 }),
        catchError(err => throwError(() => err)),
        shareReplay(1)
      );
    }
    return this._cacheTodas$;
  }

  obtenerDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE}/boletas/detalle/${id}`).pipe(
      timeout(this.T_DETALLE),
      retry({ count: 1, delay: 800 }),
      catchError(err => throwError(() => err))
    );
  }

  cambiarEstado(id: number, estado: number): Observable<any> {
    return this.http.put<any>(`${this.BASE}/boletas/cambiar-estado/${id}/${estado}`, {}).pipe(
      timeout(this.T_ACCION),
      catchError(err => throwError(() => err))
    );
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.BASE}/dashboard/resumen`).pipe(
      timeout(this.T_LISTA),
      retry({ count: 2, delay: 1000 }),
      catchError(err => throwError(() => err))
    );
  }
}
