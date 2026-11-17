import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';
import { Projet } from '../models/projet.model';

@Injectable({ providedIn: 'root' })
export class ClientService {

  private api = `${environment.apiUrl}/clients`;

  // Change après chaque envoi de logo pour forcer le navigateur à recharger l'image
  logoVersion = signal(Date.now());

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.api);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.api}/${id}`);
  }

  getProjets(id: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.api}/${id}/projets`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.api, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.api}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // ---------- Logo ----------

  // Adresse de l'image (publique, utilisable directement dans <img src>)
  logoUrl(id: number): string {
    return `${this.api}/${id}/logo?v=${this.logoVersion()}`;
  }

  // Envoi du logo en multipart/form-data (champ "file")
  uploadLogo(id: number, file: File): Observable<Client> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Client>(`${this.api}/${id}/logo`, form)
      .pipe(tap(() => this.logoVersion.set(Date.now())));
  }

  deleteLogo(id: number): Observable<Client> {
    return this.http.delete<Client>(`${this.api}/${id}/logo`)
      .pipe(tap(() => this.logoVersion.set(Date.now())));
  }
}
