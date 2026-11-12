import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../core/models/client.model';
import { Projet } from '../../../core/models/projet.model';

// Fiche client + liste de ses projets (relation One-to-Many)
@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [PageTitleComponent, RouterLink, DecimalPipe],
  templateUrl: './client-detail.component.html'
})
export class ClientDetailComponent implements OnInit {

  @Input() id!: string;

  client = signal<Client | null>(null);
  projets = signal<Projet[]>([]);
  budgetTotal = computed(() => this.projets().reduce((s, p) => s + (p.budget ?? 0), 0));

  constructor(private clientService: ClientService, public auth: AuthService,
              private notif: NotificationService, private router: Router) {}

  ngOnInit(): void {
    forkJoin({ c: this.clientService.getById(+this.id), p: this.clientService.getProjets(+this.id) })
      .subscribe({
        next: ({ c, p }) => { this.client.set(c); this.projets.set(p); },
        error: err => { this.notif.httpError(err); this.router.navigate(['/clients']); }
      });
  }
}
