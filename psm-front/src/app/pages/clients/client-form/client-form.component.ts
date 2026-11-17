import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ClientService } from '../../../core/services/client.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../core/models/client.model';

const TYPES_IMAGE = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_IMAGE = 2 * 1024 * 1024; // 2 Mo

// Même composant pour l'ajout (/clients/new) et la modification (/clients/edit/:id)
@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [PageTitleComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {

  @Input() id?: string;   // paramètre :id de la route (withComponentInputBinding)

  form!: FormGroup;
  submitted = false;
  saving = false;

  // Logo
  logoFile: File | null = null;   // nouveau fichier choisi
  preview: string | null = null;  // aperçu du nouveau fichier
  logoActuel = false;             // le client a déjà un logo (modification)
  supprimerLogo = false;          // l'utilisateur veut retirer le logo actuel
  logoErreur = '';

  constructor(private fb: FormBuilder, public clientService: ClientService,
              private notif: NotificationService, private router: Router) {}

  get isEdit(): boolean { return !!this.id; }
  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', Validators.required],
      adresse: ['']
    });
    if (this.isEdit) {
      this.clientService.getById(+this.id!).subscribe({
        next: c => { this.form.patchValue(c); this.logoActuel = !!c.hasLogo; },
        error: err => { this.notif.httpError(err); this.router.navigate(['/clients']); }
      });
    }
  }

  // Choix d'une image : vérification + aperçu
  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.logoErreur = '';
    if (!file) return;
    if (!TYPES_IMAGE.includes(file.type)) {
      this.logoErreur = 'Format non supporté : PNG, JPG, GIF ou WEBP uniquement.';
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE) {
      this.logoErreur = "L'image ne doit pas dépasser 2 Mo.";
      input.value = '';
      return;
    }
    this.logoFile = file;
    this.supprimerLogo = false;
    const reader = new FileReader();
    reader.onload = () => this.preview = reader.result as string;
    reader.readAsDataURL(file);
  }

  retirerLogo(input: HTMLInputElement): void {
    if (this.logoFile) {        // annule le fichier choisi
      this.logoFile = null;
      this.preview = null;
      input.value = '';
    } else {                    // retire le logo déjà enregistré
      this.supprimerLogo = true;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;

    const save$ = this.isEdit
      ? this.clientService.update(+this.id!, this.form.value)
      : this.clientService.create(this.form.value);

    // 1) on enregistre le client, 2) puis on envoie (ou retire) le logo
    save$.pipe(
      switchMap(client => this.traiterLogo(client))
    ).subscribe({
      next: () => {
        this.notif.success(this.isEdit ? 'Client modifié' : 'Client ajouté');
        this.router.navigate(['/clients']);
      },
      error: (err: HttpErrorResponse) => { this.saving = false; this.notif.httpError(err); }
    });
  }

  private traiterLogo(client: Client): Observable<Client> {
    let logo$: Observable<Client> | null = null;
    if (this.logoFile) {
      logo$ = this.clientService.uploadLogo(client.id!, this.logoFile);
    } else if (this.supprimerLogo && this.logoActuel) {
      logo$ = this.clientService.deleteLogo(client.id!);
    }
    if (!logo$) return of(client);

    // Si le logo est refusé, le client reste enregistré : on prévient sans bloquer
    return logo$.pipe(catchError((err: HttpErrorResponse) => {
      this.notif.error('Client enregistré, mais logo refusé : ' + (err.error?.message ?? 'erreur'));
      return of(client);
    }));
  }
}
