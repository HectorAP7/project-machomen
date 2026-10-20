import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './componentes/navbar/navbar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('machomen-web');
  showLayout = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects ?? e.url;
      this.showLayout = !url.includes('/login')
                     && !url.includes('/registro')
                     && !url.startsWith('/admin')
                     && !url.startsWith('/vendedor')
                     && !url.startsWith('/oauth2');
    });
  }
}
