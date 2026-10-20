import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cupon {
  idcupon?: number;
  codigo: string;
  tipo: number;      // 1 = porcentaje, 2 = monto fijo
  valor: number;
  minimo?: number;
  usos_max?: number;
  usos?: number;
  estado?: number;
}

export interface ValidacionCupon {
  valido: boolean;
  mensaje: string;
  codigo?: string;
  tipo?: number;
  valor?: number;
  descuento?: number;
}

@Injectable({ providedIn: 'root' })
export class CuponService {
  private readonly BASE = `${environment.apiGateway}/api/cupones`;

  constructor(private http: HttpClient) {}

  // Admin
  listar(): Observable<Cupon[]> { return this.http.get<Cupon[]>(this.BASE); }
  crear(c: Cupon): Observable<any> { return this.http.post(this.BASE, c); }
  actualizar(id: number, c: Cupon): Observable<any> { return this.http.put(`${this.BASE}/${id}`, c); }
  cambiarEstado(id: number, estado: number): Observable<any> {
    return this.http.put(`${this.BASE}/estado/${id}/${estado}`, {});
  }

  // Cliente
  validar(codigo: string, subtotal: number): Observable<ValidacionCupon> {
    return this.http.get<ValidacionCupon>(`${this.BASE}/validar?codigo=${encodeURIComponent(codigo)}&subtotal=${subtotal}`);
  }
}
