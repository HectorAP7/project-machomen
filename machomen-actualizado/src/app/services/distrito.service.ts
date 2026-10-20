import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, retry, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Distrito } from '../models/tienda.models';

@Injectable({ providedIn: 'root' })
export class DistritoService {

  private readonly BASE = `${environment.apiGateway}/api/distritos`;
  private _cache$?: Observable<Distrito[]>;

  constructor(private http: HttpClient) {}

  listar(): Observable<Distrito[]> {
    // Los distritos nunca cambian → caché permanente en toda la sesión
    if (!this._cache$) {
      this._cache$ = this.http.get<Distrito[]>(this.BASE).pipe(
        timeout(6000),
        retry({ count: 2, delay: 800 }),
        shareReplay(1)   // ← una sola llamada HTTP aunque 5 componentes la pidan
      );
    }
    return this._cache$;
  }
}
