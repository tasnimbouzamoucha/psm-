import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';

// Layout "vertical" du template Velzon : menu latéral + barre du haut + contenu
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, FooterComponent],
  template: `
    <div id="layout-wrapper">
      <app-topbar (mobileMenuButtonClicked)="toggleMenu()"></app-topbar>
      <app-sidebar (closeMobileMenu)="closeMobileMenu()"></app-sidebar>
      <div class="main-content">
        <div class="page-content">
          <div class="container-fluid">
            <router-outlet></router-outlet>
          </div>
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit {

  ngOnInit(): void {
    // Attributs lus par le CSS Velzon
    const html = document.documentElement;
    html.setAttribute('data-layout', 'vertical');
    html.setAttribute('data-topbar', 'light');
    html.setAttribute('data-sidebar', 'dark');
    html.setAttribute('data-layout-style', 'default');
    html.setAttribute('data-layout-mode', 'light');
    html.setAttribute('data-layout-width', 'fluid');
    html.setAttribute('data-layout-position', 'fixed');
    html.setAttribute('data-sidebar-image', 'none');
    html.setAttribute('data-preloader', 'disable');
    this.onResize();
  }

  @HostListener('window:resize')
  onResize(): void {
    const w = document.documentElement.clientWidth;
    document.documentElement.setAttribute('data-sidebar-size', w <= 1024 && w > 767 ? 'sm' : 'lg');
  }

  // Bouton "hamburger" : réduit le menu (PC) ou l'ouvre/ferme (mobile)
  toggleMenu(): void {
    const html = document.documentElement;
    if (html.clientWidth <= 767) {
      document.body.classList.toggle('vertical-sidebar-enable');
    } else {
      const size = html.getAttribute('data-sidebar-size');
      html.setAttribute('data-sidebar-size', size === 'sm' ? 'lg' : 'sm');
    }
  }

  closeMobileMenu(): void {
    document.body.classList.remove('vertical-sidebar-enable');
  }
}
