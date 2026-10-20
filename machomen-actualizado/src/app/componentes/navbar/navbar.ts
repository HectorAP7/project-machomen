import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CarritoService } from '../../services/carrito';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  /** Menú hamburguesa (móvil) */
  menuMovil = false;
  /** Dropdown del usuario (independiente del menú móvil) */
  menuUsuario = false;
  /** True cuando se hace scroll: compacta el navbar */
  scrolled = false;
  /** Texto del buscador */
  textoBusqueda = '';

  cantidadItems = 0;
  private sub?: Subscription;

  constructor(
    public auth: AuthService,
    public carritoSvc: CarritoService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = this.carritoSvc.cart$.subscribe(items => {
      this.cantidadItems = items.reduce((a, i) => a + i.cantidad, 0);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  @HostListener('window:scroll')
  onScroll() {
    const s = window.scrollY > 40;
    if (s !== this.scrolled) { this.scrolled = s; this.cd.detectChanges(); }
  }

  /** Cierra el dropdown del usuario si se hace clic fuera */
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (this.menuUsuario && !target.closest('.mm-user-dropdown')) {
      this.menuUsuario = false;
      this.cd.detectChanges();
    }
  }

  toggleMovil()   { this.menuMovil = !this.menuMovil; }
  toggleUsuario(ev: Event) { ev.stopPropagation(); this.menuUsuario = !this.menuUsuario; }
  closeAll()      { this.menuMovil = false; this.menuUsuario = false; }
  logout()        { this.closeAll(); this.auth.logout(); }

  /** Busca: navega al catálogo con el texto como query param */
  buscar() {
    const q = this.textoBusqueda.trim();
    this.closeAll();
    this.router.navigate(['/catalogo'], { queryParams: { q: q || null } });
  }
}
