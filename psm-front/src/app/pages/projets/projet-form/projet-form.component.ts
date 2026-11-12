import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ProjetService } from '../../../core/services/projet.service';
import { ClientService } from '../../../core/services/client.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Client } from '../../../core/models/client.model';

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
        next: p => this.form.patchValue({ ...p, idClient: p.client?.id }),
        error: err => { this.notif.httpError(err); this.router.navigate(['/projets']); }
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;

    const data = this.form.value;
    const req = this.isEdit ? this.projetService.update(+this.id!, data) : this.projetService.create(data);

    req.subscribe({
      next: () => {
        this.notif.success(this.isEdit ? 'Projet modifié' : 'Projet ajouté');
        this.router.navigate(['/projets']);
      },
      error: (err: HttpErrorResponse) => { this.saving = false; this.notif.httpError(err); }
    });
  }
}
