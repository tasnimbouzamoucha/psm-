import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [PageTitleComponent, RouterLink, FormsModule],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {

  clients = signal<Client[]>([]);
  search = signal('');
  loading = signal(true);

  filtered = computed(() => {
    const s = this.search().toLowerCase().trim();
    return this.clients().filter(c =>
      !s || [c.nom, c.email, c.tel, c.adresse].some(v => v?.toLowerCase().includes(s)));
  });

  constructor(private clientService: ClientService, public auth: AuthService,
              private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.clientService.getAll().subscribe({
      next: data => { this.clients.set(data); this.loading.set(false); },
      error: err => { this.loading.set(false); this.notif.httpError(err); }
    });
  }

  async delete(c: Client): Promise<void> {
    if (!(await this.notif.confirmDelete(`Le client « ${c.nom} » et tous ses projets`))) return;
    this.clientService.delete(c.id!).subscribe({
      next: () => { this.notif.success('Client supprimé'); this.load(); },
      error: (err: HttpErrorResponse) => this.notif.httpError(err)
    });
  }
}
