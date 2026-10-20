import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { BoletaService } from '../../../services/boleta';
import { DashboardDTO } from '../../../models/tienda.models';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  dashboard: DashboardDTO | null = null;
  pendientesBadge = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private boletaService: BoletaService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.boletaService.getDashboard().subscribe({
      next: d => { this.dashboard = d; this.cd.detectChanges(); },
      error: () => {}
    });

    this.boletaService.listarTodas().subscribe({
      next: lista => {
        this.pendientesBadge = lista.filter(p => p.estado === 1).length;
        this.cd.detectChanges();
      },
      error: () => {}
    });
  }

  logout() { this.auth.logout(); }
}
