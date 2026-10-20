import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, Usuario, RegistroClienteRequest } from '../models/tienda.models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly BASE      = `${environment.apiGateway}/api/auth`;
  private readonly STORE_KEY = 'machomen_session';

  readonly sessionSubject: BehaviorSubject<LoginResponse | null>;
  session$: Observable<LoginResponse | null>;

  constructor(private http: HttpClient, private router: Router) {
    const stored  = localStorage.getItem(this.STORE_KEY);
    const session = stored ? JSON.parse(stored) : null;
    const valid   = session && !this.isExpired(session.token) ? session : null;
    if (!valid && stored) localStorage.removeItem(this.STORE_KEY);
    this.sessionSubject = new BehaviorSubject<LoginResponse | null>(valid);
    this.session$ = this.sessionSubject.asObservable();
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get currentUser():    LoginResponse | null { return this.sessionSubject.value; }
  get token():          string | null        { return this.currentUser?.token ?? null; }
  get usuario():        Usuario | null       { return this.currentUser?.usuario ?? null; }
  get isAuthenticated():boolean              { return !!this.currentUser && !this.isExpired(this.token!); }
  get isAdmin():        boolean              { return this.usuario?.rol === 1; }
  get isCliente():      boolean              { return this.usuario?.rol === 2; }
  get isVendedor():     boolean              { return this.usuario?.rol === 3; }

  // ── API ───────────────────────────────────────────────────────────────────

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE}/login`, req).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  registrar(data: RegistroClienteRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.BASE}/registrar`, data);
  }

  /**
   * Verifica un token JWT contra el backend y devuelve la sesión completa
   * con el usuario completo (nombres, dni, iddistrito, dirección, etc.).
   * Usado por OAuth2Callback para obtener datos que no están en el JWT.
   */
  verificarTokenYCargarUsuario(token: string): Observable<LoginResponse> {
    return this.http.get<{ token: string; usuario: Usuario }>(
      `${this.BASE}/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      map(res => ({ token: res.token, usuario: res.usuario }))
    );
  }

  /** Usado por OAuth2Callback y login normal para guardar la sesión */
  guardarSesionDesdeToken(res: LoginResponse): void {
    this.guardarSesion(res);
  }

  logout(): void {
    localStorage.removeItem(this.STORE_KEY);
    this.sessionSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private guardarSesion(res: LoginResponse): void {
    localStorage.setItem(this.STORE_KEY, JSON.stringify(res));
    this.sessionSubject.next(res);
  }

  isExpired(token: string): boolean {
    try { const d: any = jwtDecode(token); return d.exp * 1000 < Date.now(); }
    catch { return true; }
  }
}
