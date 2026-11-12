import { Component, EventEmitter, Output, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MENU } from './menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

  @Output() closeMobileMenu = new EventEmitter<void>();

  // 10) Le menu tient compte des rôles de l'utilisateur connecté
  menuItems = computed(() => {
    this.auth.currentUser(); // recalcul quand l'utilisateur change
    return MENU.filter(item => !item.roles || this.auth.hasAnyRole(item.roles));
  });

  constructor(private auth: AuthService) {}
}
