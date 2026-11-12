import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

// Petites alertes (toast) et boîtes de confirmation avec SweetAlert2
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });

  success(message: string): void {
    this.toast.fire({ icon: 'success', title: message });
  }

  error(message: string): void {
    this.toast.fire({ icon: 'error', title: message });
  }

  // Message lisible à partir d'une erreur HTTP renvoyée par Spring Boot
  httpError(err: HttpErrorResponse, fallback = 'Une erreur est survenue'): void {
    if (err.status === 0) {
      this.error('Serveur injoignable. Spring Boot est-il démarré ?');
    } else {
      this.error(err.error?.message ?? fallback);
    }
  }

  async confirmDelete(what: string): Promise<boolean> {
    const res = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `${what} sera définitivement supprimé.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: {
        confirmButton: 'btn btn-danger w-xs me-2 mt-2',
        cancelButton: 'btn btn-light w-xs mt-2'
      },
      buttonsStyling: false
    });
    return res.isConfirmed;
  }
}
