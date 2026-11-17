import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ProjetService } from '../../../core/services/projet.service';
import { ClientService } from '../../../core/services/client.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../core/models/client.model';
import { Projet } from '../../../core/models/projet.model';

const MAX_PDF = 5 * 1024 * 1024; // 5 Mo

@Component({
  selector: 'app-projet-form',
  standalone: true,
  imports: [PageTitleComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './projet-form.component.html'
})
export class ProjetFormComponent implements OnInit {

  @Input() id?: string;

  form!: FormGroup;
  clients = signal<Client[]>([]);
  submitted = false;
  saving = false;

  // Cahier des charges (PDF)
  pdfFile: File | null = null;
  cahierActuelNom: string | null = null;  // PDF déjà enregistré (modification)
  supprimerCahier = false;
  pdfErreur = '';

  constructor(private fb: FormBuilder, private projetService: ProjetService,
              private clientService: ClientService, private notif: NotificationService,
              private router: Router, private route: ActivatedRoute) {}

  get isEdit(): boolean { return !!this.id; }
  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.form = this.fb.group({
      libelle: ['', Validators.required],
      idClient: [null, Validators.required],
      budget: [null, [Validators.required, Validators.min(0)]],
      duree: [null, [Validators.required, Validators.min(1)]],
      description: ['']
    });

    this.clientService.getAll().subscribe(c => this.clients.set(c));

    // depuis la fiche client : /projets/new?client=3
    const preselect = this.route.snapshot.queryParamMap.get('client');
    if (preselect) this.form.patchValue({ idClient: +preselect });

    if (this.isEdit) {
      this.projetService.getById(+this.id!).subscribe({
        next: p => {
          this.form.patchValue({ ...p, idClient: p.client?.id });
          this.cahierActuelNom = p.hasCahierCharges ? (p.cahierChargesNom ?? 'cahier-des-charges.pdf') : null;
        },
        error: err => { this.notif.httpError(err); this.router.navigate(['/projets']); }
      });
    }
  }

  // Choix du PDF : vérification du type et de la taille
  onPdfChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.pdfErreur = '';
    this.pdfFile = null;
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.pdfErreur = 'Le fichier doit être un PDF.';
      input.value = '';
      return;
    }
    if (file.size > MAX_PDF) {
      this.pdfErreur = 'Le PDF ne doit pas dépasser 5 Mo.';
      input.value = '';
      return;
    }
    this.pdfFile = file;
    this.supprimerCahier = false;
  }

  annulerPdf(input: HTMLInputElement): void {
    this.pdfFile = null;
    input.value = '';
  }

  voirPdfActuel(): void {
    this.projetService.ouvrirCahierCharges(+this.id!, () => this.notif.error("Impossible d'ouvrir le PDF"));
  }

  tailleMo(file: File): string {
    return (file.size / 1024 / 1024).toFixed(2);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;

    const data = this.form.value;
    const save$ = this.isEdit ? this.projetService.update(+this.id!, data) : this.projetService.create(data);

    // 1) on enregistre le projet, 2) puis on envoie (ou retire) le PDF
    save$.pipe(
      switchMap(projet => this.traiterPdf(projet))
    ).subscribe({
      next: () => {
        this.notif.success(this.isEdit ? 'Projet modifié' : 'Projet ajouté');
        this.router.navigate(['/projets']);
      },
      error: (err: HttpErrorResponse) => { this.saving = false; this.notif.httpError(err); }
    });
  }

  private traiterPdf(projet: Projet): Observable<Projet> {
    let pdf$: Observable<Projet> | null = null;
    if (this.pdfFile) {
      pdf$ = this.projetService.uploadCahierCharges(projet.id!, this.pdfFile);
    } else if (this.supprimerCahier && this.cahierActuelNom) {
      pdf$ = this.projetService.deleteCahierCharges(projet.id!);
    }
    if (!pdf$) return of(projet);

    // Si le PDF est refusé, le projet reste enregistré : on prévient sans bloquer
    return pdf$.pipe(catchError((err: HttpErrorResponse) => {
      this.notif.error('Projet enregistré, mais PDF refusé : ' + (err.error?.message ?? 'erreur'));
      return of(projet);
    }));
  }
}
