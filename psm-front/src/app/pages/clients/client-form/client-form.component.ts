import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ClientService } from '../../../core/services/client.service';
import { NotificationService } from '../../../core/services/notification.service';

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

  constructor(private fb: FormBuilder, private clientService: ClientService,
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
        next: c => this.form.patchValue(c),
        error: err => { this.notif.httpError(err); this.router.navigate(['/clients']); }
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.saving = true;

    const req = this.isEdit
      ? this.clientService.update(+this.id!, this.form.value)
      : this.clientService.create(this.form.value);

    req.subscribe({
      next: () => {
        this.notif.success(this.isEdit ? 'Client modifié' : 'Client ajouté');
        this.router.navigate(['/clients']);
      },
      error: (err: HttpErrorResponse) => { this.saving = false; this.notif.httpError(err); }
    });
  }
}
