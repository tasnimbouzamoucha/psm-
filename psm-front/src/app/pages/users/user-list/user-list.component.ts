import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role, User } from '../../../core/models/user.model';

// Gestion des utilisateurs : réservé à l'ADMIN (roleGuard + sécurité Spring)
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [PageTitleComponent, FormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  search = signal('');
  editingId = signal<number | null>(null);
  selectedRoles: Record<string, boolean> = {};

  filtered = computed(() => {
    const s = this.search().toLowerCase().trim();
    return this.users().filter(u =>
      !s || [u.nom, u.prenom, u.email, u.tel].some(v => v?.toLowerCase().includes(s)));
  });

  constructor(private userService: UserService, public auth: AuthService,
              private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
    this.userService.getRoles().subscribe(r => this.roles.set(r));
  }

  load(): void {
    this.userService.getAll().subscribe({
      next: u => this.users.set(u),
      error: err => this.notif.httpError(err)
    });
  }

  hasRole(u: User, role: string): boolean {
    return u.roles.some(r => r.libelle === role);
  }

  isMe(u: User): boolean {
    return u.id === this.auth.currentUser()?.id;
  }

  startEdit(u: User): void {
    this.editingId.set(u.id);
    this.selectedRoles = {};
    this.roles().forEach(r => this.selectedRoles[r.libelle] = this.hasRole(u, r.libelle));
  }

  saveRoles(u: User): void {
    const roles = Object.keys(this.selectedRoles).filter(k => this.selectedRoles[k]);
    if (roles.length === 0) {
      this.notif.error('Choisissez au moins un rôle');
      return;
    }
    this.userService.updateRoles(u.id, roles).subscribe({
      next: () => { this.notif.success('Rôles mis à jour'); this.editingId.set(null); this.load(); },
      error: (err: HttpErrorResponse) => this.notif.httpError(err)
    });
  }

  async delete(u: User): Promise<void> {
    if (!(await this.notif.confirmDelete(`L'utilisateur « ${u.prenom} ${u.nom} »`))) return;
    this.userService.delete(u.id).subscribe({
      next: () => { this.notif.success('Utilisateur supprimé'); this.load(); },
      error: (err: HttpErrorResponse) => this.notif.httpError(err)
    });
  }
}
