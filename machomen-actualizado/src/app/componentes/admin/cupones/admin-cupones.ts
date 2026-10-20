import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuponService, Cupon } from '../../../services/cupon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-cupones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
  <div>
    <p class="mm-eyebrow mb-1" style="font-size:.62rem;">Marketing</p>
    <h4 class="fw-bold mb-0" style="font-family:'Cinzel',serif;">Cupones de Descuento</h4>
  </div>
  <button class="mm-btn mm-btn-dark" (click)="abrirForm()">
    <i class="bi bi-plus-lg"></i>Nuevo Cupón
  </button>
</div>

<div *ngIf="cargando" class="text-center py-5"><div class="mm-spinner mx-auto"></div></div>

<div *ngIf="!cargando" class="mm-panel p-0">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0" style="font-size:.85rem;">
      <thead style="background:#fafafa;">
        <tr class="text-muted text-uppercase" style="font-size:.62rem;letter-spacing:.08em;">
          <th class="ps-4 py-3">Código</th><th>Descuento</th><th>Mínimo</th><th>Usos</th><th class="text-center">Estado</th><th class="text-end pe-4">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of cupones" style="border-bottom:1px solid #f5f5f5;">
          <td class="ps-4 fw-bold" style="letter-spacing:.05em;"><i class="bi bi-ticket-perforated me-1 text-gold"></i>{{ c.codigo }}</td>
          <td class="fw-bold">
            <span *ngIf="c.tipo===1">{{ c.valor }}%</span>
            <span *ngIf="c.tipo===2">S/ {{ c.valor | number:'1.2-2' }}</span>
          </td>
          <td class="text-muted">{{ (c.minimo && c.minimo>0) ? ('S/ ' + (c.minimo | number:'1.2-2')) : '—' }}</td>
          <td class="text-muted">{{ c.usos || 0 }}{{ c.usos_max && c.usos_max>0 ? ' / ' + c.usos_max : '' }}</td>
          <td class="text-center">
            <span class="mm-estado" [style.background]="c.estado===1?'#dcfce7':'#fee2e2'" [style.color]="c.estado===1?'#15803d':'#991b1b'">
              {{ c.estado===1 ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td class="text-end pe-4">
            <button class="btn btn-sm btn-outline-secondary rounded-0" (click)="toggleEstado(c)" style="font-size:.7rem;">
              {{ c.estado===1 ? 'Desactivar' : 'Activar' }}
            </button>
          </td>
        </tr>
        <tr *ngIf="cupones.length===0">
          <td colspan="6" class="text-center py-4 text-muted">No hay cupones. Crea el primero.</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- Modal crear: SOLO cierra si el mousedown empezó Y terminó en el fondo -->
<div *ngIf="mostrarForm" class="mm-modal-bg"
     (mousedown)="onBgDown($event)" (mouseup)="onBgUp($event)">
  <div class="mm-modal" (mousedown)="$event.stopPropagation()">
    <div class="mm-modal-head">
      <span><i class="bi bi-ticket-perforated me-2"></i>Nuevo Cupón</span>
      <button (click)="cerrarForm()" type="button"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="mm-modal-body">
      <label class="mm-perfil-label">Código *</label>
      <input type="text" [(ngModel)]="nuevo.codigo" class="form-control mm-input mb-3"
             placeholder="MACHO10" style="text-transform:uppercase;" autocomplete="off">

      <label class="mm-perfil-label">Tipo de descuento *</label>
      <select [(ngModel)]="nuevo.tipo" class="form-select mm-input mb-3">
        <option [ngValue]="1">Porcentaje (%)</option>
        <option [ngValue]="2">Monto fijo (S/)</option>
      </select>

      <label class="mm-perfil-label">Valor * {{ nuevo.tipo===1 ? '(%)' : '(S/)' }}</label>
      <input type="number" [(ngModel)]="nuevo.valor" class="form-control mm-input mb-3" min="1" placeholder="10" inputmode="decimal">

      <label class="mm-perfil-label">Compra mínima (opcional)</label>
      <input type="number" [(ngModel)]="nuevo.minimo" class="form-control mm-input mb-3" min="0" placeholder="0" inputmode="decimal">

      <label class="mm-perfil-label">Límite de usos (0 = ilimitado)</label>
      <input type="number" [(ngModel)]="nuevo.usos_max" class="form-control mm-input" min="0" placeholder="0" inputmode="numeric">

      <!-- Vista previa del cupón -->
      <div class="mm-cupon-preview" *ngIf="nuevo.codigo">
        <div class="mm-cupon-preview-left">
          <i class="bi bi-ticket-perforated"></i>
          <div>
            <div class="mm-cupon-preview-code">{{ nuevo.codigo || 'CÓDIGO' }}</div>
            <div class="mm-cupon-preview-desc">
              {{ nuevo.tipo===1 ? nuevo.valor + '% de descuento' : 'S/ ' + (nuevo.valor||0) + ' de descuento' }}
              {{ (nuevo.minimo && nuevo.minimo>0) ? ' · desde S/ ' + nuevo.minimo : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mm-modal-foot">
      <button class="mm-btn mm-btn-outline" (click)="cerrarForm()" [disabled]="guardando" type="button">Cancelar</button>
      <button class="mm-btn mm-btn-dark" (click)="guardar()" [disabled]="guardando" type="button">
        <span *ngIf="guardando" class="mm-spinner-sm me-2"></span>
        {{ guardando ? 'Guardando...' : 'Crear Cupón' }}
      </button>
    </div>
  </div>
</div>

<style>
.mm-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:2000; padding:1rem; animation:mmFadeIn .2s ease; }
.mm-modal { background:#fff; width:100%; max-width:460px; max-height:92vh; overflow:auto; animation:mmFadeUp .3s ease; box-shadow:0 24px 60px rgba(0,0,0,.4); }
.mm-modal-head { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#0d0d0d,#1f1f1f); color:#fff; padding:1.1rem 1.5rem; font-family:'Cinzel',serif; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }
.mm-modal-head span i { color:#c9a84c; }
.mm-modal-head button { background:none; border:none; color:#fff; cursor:pointer; font-size:1rem; transition:color .2s; }
.mm-modal-head button:hover { color:#c9a84c; }
.mm-modal-body { padding:1.5rem; }
.mm-modal-foot { display:flex; gap:.5rem; justify-content:flex-end; padding:1rem 1.5rem; border-top:1px solid #eee; }

/* Vista previa del cupón (ticket) */
.mm-cupon-preview { margin-top:1.25rem; background:linear-gradient(135deg,#0d0d0d,#222); color:#fff; padding:1rem 1.25rem; position:relative; overflow:hidden; }
.mm-cupon-preview::before, .mm-cupon-preview::after { content:''; position:absolute; width:18px; height:18px; background:#fff; border-radius:50%; top:50%; transform:translateY(-50%); }
.mm-cupon-preview::before { left:-9px; } .mm-cupon-preview::after { right:-9px; }
.mm-cupon-preview-left { display:flex; align-items:center; gap:.85rem; }
.mm-cupon-preview-left > i { font-size:1.6rem; color:#c9a84c; }
.mm-cupon-preview-code { font-family:'Cinzel',serif; font-weight:700; font-size:1.1rem; letter-spacing:.08em; color:#c9a84c; }
.mm-cupon-preview-desc { font-size:.74rem; color:rgba(255,255,255,.7); margin-top:2px; }
</style>
  `
})
export class AdminCupones implements OnInit {
  cupones: Cupon[] = [];
  cargando = true;
  mostrarForm = false;
  guardando = false;
  nuevo: Cupon = { codigo:'', tipo:1, valor:10, minimo:0, usos_max:0, estado:1 };

  // Control de cierre por clic en el fondo
  private bgDownOnBackdrop = false;

  constructor(private cuponSvc: CuponService, private cd: ChangeDetectorRef) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.cuponSvc.listar().subscribe({
      next: list => { this.cupones = list.sort((a,b)=>(b.idcupon||0)-(a.idcupon||0)); this.cargando=false; this.cd.detectChanges(); },
      error: () => { this.cargando=false; this.cd.detectChanges(); }
    });
  }

  abrirForm() {
    this.nuevo = { codigo:'', tipo:1, valor:10, minimo:0, usos_max:0, estado:1 };
    this.mostrarForm = true;
  }

  cerrarForm() { this.mostrarForm = false; }

  /** El clic SOLO cierra si empezó (mousedown) en el fondo y terminó (mouseup) en el fondo.
   *  Así, arrastrar desde un input (flechitas, selección) nunca cierra el modal. */
  onBgDown(ev: MouseEvent) {
    this.bgDownOnBackdrop = (ev.target as HTMLElement).classList.contains('mm-modal-bg');
  }
  onBgUp(ev: MouseEvent) {
    const upOnBackdrop = (ev.target as HTMLElement).classList.contains('mm-modal-bg');
    if (this.bgDownOnBackdrop && upOnBackdrop) this.mostrarForm = false;
    this.bgDownOnBackdrop = false;
  }

  guardar() {
    if (!this.nuevo.codigo.trim() || !this.nuevo.valor || this.nuevo.valor <= 0) {
      Swal.fire({ icon:'warning', title:'Datos incompletos', text:'Ingresa código y un valor válido.', confirmButtonColor:'#111' });
      return;
    }
    this.guardando = true;
    this.cuponSvc.crear(this.nuevo).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarForm = false;
        this.cargar();
        Swal.fire({ icon:'success', title:'¡Cupón creado!', timer:1500, showConfirmButton:false });
      },
      error: err => {
        this.guardando = false;
        this.cd.detectChanges();
        let detalle = 'No se pudo crear el cupón.';
        if (err?.status === 0)        detalle = 'No hay conexión con el servidor (ms-productos no responde).';
        else if (err?.status === 404) detalle = 'El endpoint /api/cupones no existe. Falta recompilar ms-productos.';
        else if (err?.status === 500) detalle = 'Error en el servidor (revisa que la tabla tb_cupon exista). ' + (err?.error?.error || '');
        else if (err?.error?.error)   detalle = err.error.error;
        Swal.fire({ icon:'error', title:'Error', text:detalle, confirmButtonColor:'#111' });
      }
    });
  }

  toggleEstado(c: Cupon) {
    const nuevo = c.estado === 1 ? 0 : 1;
    this.cuponSvc.cambiarEstado(c.idcupon!, nuevo).subscribe({
      next: () => { c.estado = nuevo; this.cd.detectChanges(); },
      error: () => Swal.fire({ icon:'error', title:'Error', text:'No se pudo cambiar el estado.', confirmButtonColor:'#111' })
    });
  }
}
