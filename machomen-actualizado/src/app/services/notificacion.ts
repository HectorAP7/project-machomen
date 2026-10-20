import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notificacion {
  id:      number;
  tipo:    'pedido_nuevo' | 'pedido_aprobado' | 'pedido_anulado' | 'estado_cambio' | 'info';
  titulo:  string;
  mensaje: string;
  fecha:   Date;
  leida:   boolean;
  idBoleta?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {

  private notifs: Notificacion[] = [];
  private counter = 1;
  private subject = new BehaviorSubject<Notificacion[]>([]);
  notificaciones$ = this.subject.asObservable();

  get noLeidas(): number {
    return this.notifs.filter(n => !n.leida).length;
  }

  agregar(notif: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) {
    this.notifs.unshift({
      ...notif,
      id:    this.counter++,
      fecha: new Date(),
      leida: false
    });
    // Mantener máximo 20
    if (this.notifs.length > 20) this.notifs = this.notifs.slice(0, 20);
    this.subject.next([...this.notifs]);
  }

  marcarLeida(id: number) {
    const n = this.notifs.find(x => x.id === id);
    if (n) { n.leida = true; this.subject.next([...this.notifs]); }
  }

  marcarTodasLeidas() {
    this.notifs.forEach(n => n.leida = true);
    this.subject.next([...this.notifs]);
  }

  limpiar() {
    this.notifs = [];
    this.subject.next([]);
  }

  getAll(): Notificacion[] { return this.notifs; }
}
