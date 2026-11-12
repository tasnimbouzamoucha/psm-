import { Component, OnInit, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageTitleComponent } from '../../shared/page-title/page-title.component';
import { ClientService } from '../../core/services/client.service';
import { ProjetService } from '../../core/services/projet.service';
import { AuthService } from '../../core/services/auth.service';
import { Client } from '../../core/models/client.model';
import { Projet } from '../../core/models/projet.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageTitleComponent, RouterLink, DecimalPipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  clients = signal<Client[]>([]);
  projets = signal<Projet[]>([]);
  loading = signal(true);

  budgetTotal = computed(() => this.projets().reduce((s, p) => s + (p.budget ?? 0), 0));
  dureeMoyenne = computed(() => {
    const p = this.projets();
    return p.length ? p.reduce((s, x) => s + (x.duree ?? 0), 0) / p.length : 0;
  });
  derniersProjets = computed(() => [...this.projets()].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 5));

  constructor(private clientService: ClientService, private projetService: ProjetService,
              public auth: AuthService) {}

  ngOnInit(): void {
    forkJoin({ clients: this.clientService.getAll(), projets: this.projetService.getAll() })
      .subscribe({
        next: ({ clients, projets }) => {
          this.clients.set(clients);
          this.projets.set(projets);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }
}
