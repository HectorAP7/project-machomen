import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="d-flex flex-column align-items-center justify-content-center text-center"
     style="min-height:70vh;padding:2rem;">
  <div class="fw-bold mb-3" style="font-size:8rem;color:#f0f0f0;line-height:1;font-family:'Cinzel',serif;">
    404
  </div>
  <h2 class="fw-bold text-uppercase mb-2" style="font-family:'Cinzel',serif;letter-spacing:.06em;">
    Página no encontrada
  </h2>
  <p class="text-muted mb-4" style="max-width:380px;">
    La página que buscas no existe o fue movida. Vuelve al inicio o explora el catálogo.
  </p>
  <div class="d-flex gap-3">
    <a routerLink="/inicio" class="btn btn-dark rounded-0 fw-bold text-uppercase px-4">
      <i class="fa-solid fa-home me-2"></i>Inicio
    </a>
    <a routerLink="/catalogo" class="btn btn-outline-dark rounded-0 fw-bold text-uppercase px-4">
      <i class="fa-solid fa-store me-2"></i>Catálogo
    </a>
  </div>
</div>
  `
})
export class NotFound {}
