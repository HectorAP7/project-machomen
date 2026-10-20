import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { BoletaService } from '../../../services/boleta';

@Component({
  selector: 'app-vendedor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="vl-wrap">

  <!-- Sidebar -->
  <nav class="vl-sidebar">
    <div class="vl-brand">
      <h5>MACHO<span>MEN</span></h5>
      <small>Panel Vendedor</small>
    </div>

    <!-- Avatar -->
    <div class="vl-user-card">
      <div class="vl-avatar">
        {{ auth.usuario?.nombres?.charAt(0) }}{{ auth.usuario?.apellidos?.charAt(0) }}
      </div>
      <div class="overflow-hidden">
        <div class="vl-uname">{{ auth.usuario?.nombres }} {{ auth.usuario?.apellidos }}</div>
        <div class="vl-urole">Vendedor</div>
      </div>
    </div>

    <ul class="vl-nav">
      <li>
        <a routerLink="/vendedor/dashboard" routerLinkActive="vl-active" class="vl">
          <i class="bi bi-bar-chart-fill"></i><span>Dashboard</span>
          <span *ngIf="pendientes>0" class="vl-badge">{{ pendientes }}</span>
        </a>
      </li>
      <li>
        <a routerLink="/vendedor/pedidos" routerLinkActive="vl-active" class="vl">
          <i class="bi bi-receipt"></i><span>Pedidos</span>
        </a>
      </li>

      <li class="vl-heading">Cuenta</li>
      <li>
        <a routerLink="/perfil" class="vl">
          <i class="bi bi-person-circle"></i><span>Mi Perfil</span>
        </a>
      </li>
      <li>
        <a routerLink="/catalogo" class="vl">
          <i class="bi bi-shop"></i><span>Ver Tienda</span>
          <i class="bi bi-box-arrow-up-right ms-auto" style="font-size:.6rem;opacity:.4;"></i>
        </a>
      </li>
    </ul>

    <div class="vl-foot">
      <button (click)="logout()" class="vl-logout">
        <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
      </button>
    </div>
  </nav>

  <!-- Main -->
  <div class="vl-main">
    <header class="vl-header">
      <span class="vl-htitle">MachoMen · Vendedor</span>
      <span class="vl-tag"><i class="bi bi-person-badge me-1"></i>Vendedor</span>
    </header>
    <main class="vl-content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>

<style>
:host { --gold:#f59e0b; --gold-soft:#fbbf24; display:block; }
.vl-wrap { display:flex; width:100%; height:100vh; overflow:hidden; }

.vl-sidebar {
  width:230px; min-width:230px;
  display:flex; flex-direction:column;
  background:linear-gradient(180deg,#16161f 0%,#1f1f2e 100%);
  border-right:1px solid rgba(245,158,11,.14);
}
.vl-brand { text-align:center; padding:1.6rem 1rem 1rem; }
.vl-brand h5 { font-family:'Cinzel',serif; font-weight:700; color:#fff; letter-spacing:.04em; margin:0; }
.vl-brand h5 span { color:#666; }
.vl-brand small { display:block; margin-top:.3rem; font-size:.55rem; color:#555; text-transform:uppercase; letter-spacing:.18em; }

.vl-user-card {
  display:flex; align-items:center; gap:.6rem;
  margin:0 1rem 1rem; padding:.65rem;
  background:rgba(255,255,255,.05);
}
.vl-avatar {
  width:38px; height:38px; flex-shrink:0; border-radius:50%;
  background:linear-gradient(135deg,var(--gold),var(--gold-soft));
  color:#111; font-weight:700; font-size:.72rem;
  display:flex; align-items:center; justify-content:center;
}
.vl-uname { font-size:.78rem; font-weight:700; color:#fff; }
.vl-urole { font-size:.56rem; color:var(--gold); text-transform:uppercase; letter-spacing:.06em; }

.vl-nav { list-style:none; padding:0 .6rem; margin:0; flex:1; display:flex; flex-direction:column; gap:.2rem; }
.vl {
  display:flex; align-items:center; gap:.8rem; position:relative;
  padding:.6rem .85rem; color:rgba(255,255,255,.45);
  font-size:.82rem; font-weight:500; text-decoration:none; border-radius:5px;
  transition:all .18s ease;
}
.vl i:first-child { width:17px; font-size:.92rem; text-align:center; }
.vl:hover { background:rgba(255,255,255,.06); color:#fff; }
.vl-active { background:rgba(245,158,11,.16)!important; color:var(--gold)!important; }
.vl-active::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px; background:var(--gold); border-radius:2px; }
.vl-badge { margin-left:auto; background:var(--gold); color:#111; font-size:.58rem; font-weight:700; min-width:18px; padding:1px 5px; border-radius:9px; text-align:center; }
.vl-heading { padding:.9rem .85rem .35rem; font-size:.56rem; color:#4a4a55; text-transform:uppercase; letter-spacing:.14em; }

.vl-foot { padding:1rem; border-top:1px solid rgba(255,255,255,.08); }
.vl-logout {
  width:100%; text-align:left;
  background:rgba(239,68,68,.1); color:#f87171;
  border:1px solid rgba(239,68,68,.22);
  padding:.55rem .75rem; font-size:.74rem; font-weight:600; cursor:pointer; transition:all .2s;
}
.vl-logout:hover { background:rgba(239,68,68,.2); }

.vl-main { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f4f4f2; }
.vl-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:.85rem 1.5rem; background:#fff;
  border-bottom:1px solid #e8e8e8; box-shadow:0 1px 3px rgba(0,0,0,.04);
}
.vl-htitle { font-size:.7rem; text-transform:uppercase; letter-spacing:.1em; color:#aaa; font-weight:700; }
.vl-tag { background:var(--gold); color:#111; font-size:.58rem; text-transform:uppercase; letter-spacing:.06em; padding:.35rem .7rem; font-weight:700; }
.vl-content { flex:1; overflow:auto; padding:1.75rem; animation:mmFadeIn .4s ease; }

@media (max-width:768px) {
  .vl-sidebar { width:64px; min-width:64px; }
  .vl-brand small, .vl-user-card, .vl span, .vl-heading, .vl-badge, .vl-logout span { display:none; }
  .vl-content { padding:1rem; }
}
</style>
  `
})
export class VendedorLayout implements OnInit {
  pendientes = 0;
  constructor(public auth: AuthService, private boletaSvc: BoletaService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.boletaSvc.listarTodas().subscribe({
      next: lista => { this.pendientes = lista.filter((p:any) => p.estado===1).length; this.cd.detectChanges(); },
      error: () => {}
    });
  }

  logout() { this.auth.logout(); }
}
