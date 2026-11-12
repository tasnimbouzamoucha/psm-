import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.api}/users/me`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.api}/roles`);
  }

  updateRoles(id: number, roles: string[]): Observable<User> {
    return this.http.put<User>(`${this.api}/users/${id}/roles`, { roles });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }
}
