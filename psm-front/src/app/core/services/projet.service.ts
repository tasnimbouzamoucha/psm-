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
}
