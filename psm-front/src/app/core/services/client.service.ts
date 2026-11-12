import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';
import { Projet } from '../models/projet.model';

@Injectable({ providedIn: 'root' })
export class ClientService {

  private api = `${environment.apiUrl}/clients`;

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
}
