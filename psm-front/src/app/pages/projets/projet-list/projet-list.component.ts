import { Component, OnInit, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ProjetService } from '../../../core/services/projet.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Projet } from '../../../core/models/projet.model';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [PageTitleComponent, RouterLink, FormsModule, DecimalPipe],
  templateUrl: './projet-list.component.html'
})
export class ProjetListComponent implements OnInit {

  projets = signal<Projet[]>([]);
  clients = signal<Client[]>([]);
  search = signal('');
  clientFilter = signal<number | null>(null);
  loading = signal(true);

  filtered = computed(() => {
    const s = this.search().toLowerCase().trim();
    const cid = this.clientFilter();
    return this.projets().filter(p =>
      (!cid || p.client?.id === cid) &&
      (!s || [p.libelle, p.description, p.client?.nom].some(v => v?.toLowerCase().includes(s))));
  });

  constructor(private projetService: ProjetService, private clientService: ClientService,
              public auth: AuthService, private notif: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({ p: this.projetService.getAll(), c: this.clientService.getAll() }).subscribe({
      next: ({ p, c }) => { this.projets.set(p); this.clients.set(c); this.loading.set(false); },
      error: err => { this.loading.set(false); this.notif.httpError(err); }
    });
  }

  async delete(p: Projet): Promise<void> {
    if (!(await this.notif.confirmDelete(`Le projet « ${p.libelle} »`))) return;
    this.projetService.delete(p.id!).subscribe({
      next: () => { this.notif.success('Projet supprimé'); this.load(); },
      error: (err: HttpErrorResponse) => this.notif.httpError(err)
    });
  }
}
