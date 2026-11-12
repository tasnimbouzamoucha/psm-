import { Component, ElementRef, EventEmitter, HostListener, Output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {

  @Output() mobileMenuButtonClicked = new EventEmitter<void>();

  dropdownOpen = false;
  user = computed(() => this.auth.currentUser());
  initiales = computed(() => {
    const u = this.user();
    return u ? (u.prenom?.charAt(0) ?? '') + (u.nom?.charAt(0) ?? '') : '?';
  });
  roleLabel = computed(() => this.auth.isAdmin() ? 'Administrateur' : 'Collaborateur');

  constructor(public auth: AuthService, private el: ElementRef) {}

  // Ferme le menu utilisateur quand on clique ailleurs
  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!this.el.nativeElement.querySelector('.topbar-user')?.contains(e.target)) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
