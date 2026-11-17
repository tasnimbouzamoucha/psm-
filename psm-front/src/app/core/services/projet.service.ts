import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Projet, ProjetRequest } from '../models/projet.model';

@Injectable({ providedIn: 'root' })
export class ProjetService {

  private api = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.api);
  }

  getById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.api}/${id}`);
  }

  create(projet: ProjetRequest): Observable<Projet> {
    return this.http.post<Projet>(this.api, projet);
  }

  update(id: number, projet: ProjetRequest): Observable<Projet> {
    return this.http.put<Projet>(`${this.api}/${id}`, projet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // ---------- Cahier des charges (PDF) ----------

  uploadCahierCharges(id: number, file: File): Observable<Projet> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Projet>(`${this.api}/${id}/cahier-charges`, form);
  }

  // Le PDF est protégé par le token : on le télécharge avec HttpClient (l'interceptor
  // ajoute le token), puis on l'affiche dans un nouvel onglet.
  getCahierCharges(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/cahier-charges`, { responseType: 'blob' });
  }

  deleteCahierCharges(id: number): Observable<Projet> {
    return this.http.delete<Projet>(`${this.api}/${id}/cahier-charges`);
  }

  // Ouvre le PDF dans un nouvel onglet.
  // L'onglet est ouvert AVANT le téléchargement, sinon le navigateur le bloque (pop-up).
  ouvrirCahierCharges(id: number, onError: (err: unknown) => void): void {
    const onglet = window.open('', '_blank');
    this.getCahierCharges(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        if (onglet) {
          onglet.location.href = url;
        } else {
          window.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: err => {
        onglet?.close();
        onError(err);
      }
    });
  }
}
