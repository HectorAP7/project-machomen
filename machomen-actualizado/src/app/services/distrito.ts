import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Distrito } from '../models/tienda.models';

@Injectable({ providedIn: 'root' })
export class DistritoService {
  private readonly BASE = `${environment.apiGateway}/api/distritos`;
  constructor(private http: HttpClient) {}
  listar(): Observable<Distrito[]> { return this.http.get<Distrito[]>(this.BASE); }
}
