import { Component, Input, inject } from '@angular/core';
import { Client } from '../../core/models/client.model';
import { ClientService } from '../../core/services/client.service';

// Affiche le logo du client s'il existe, sinon la première lettre de son nom
@Component({
  selector: 'app-client-logo',
  standalone: true,
  template: `
    <div class="flex-shrink-0" [style.width.px]="size" [style.height.px]="size">
      @if (client?.hasLogo && client?.id && !erreur) {
        <img [src]="src" [alt]="'Logo ' + client?.nom" (error)="erreur = true"
             class="rounded border bg-white w-100 h-100" style="object-fit: contain; padding: 2px">
      } @else {
        <span class="avatar-title rounded-circle bg-soft-info text-info text-uppercase"
              [style.font-size.px]="size * 0.4">{{ client?.nom?.charAt(0) }}</span>
      }
    </div>
  `
})
export class ClientLogoComponent {
  @Input() client?: Client | null;
  @Input() size = 32;

  erreur = false;
  private clientService = inject(ClientService);

  // l'adresse contient une "version" qui change quand un nouveau logo est envoyé
  get src(): string {
    return this.client?.id ? this.clientService.logoUrl(this.client.id) : '';
  }
}
