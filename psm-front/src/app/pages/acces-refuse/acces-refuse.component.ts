import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acces-refuse',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row justify-content-center pt-5">
      <div class="col-lg-6 text-center">
        <div class="avatar-xl mx-auto mb-4">
          <span class="avatar-title rounded-circle bg-soft-danger text-danger" style="font-size: 48px">
            <i class="ri-lock-2-line"></i></span>
        </div>
        <h1 class="display-5 fw-semibold">403</h1>
        <h4 class="text-uppercase">Accès refusé</h4>
        <p class="text-muted mb-4">Votre rôle ne vous permet pas d'accéder à cette page ou d'effectuer cette action.</p>
        <a routerLink="/dashboard" class="btn btn-success"><i class="mdi mdi-home me-1"></i>Retour au tableau de bord</a>
      </div>
    </div>
  `
})
export class AccesRefuseComponent {}
