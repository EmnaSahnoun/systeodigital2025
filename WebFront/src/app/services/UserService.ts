import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, mergeMap, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService
 {
  private keycloakUrl = '/api';
  private realm = 'systeodigital';
  
  constructor(private http: HttpClient,private authService: AuthService) {}

  // Méthode pour obtenir le token d'accès (si nécessaire)
  getAccessToken(username: string, password: string): Observable<any> {
    const url = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'app-pfeFront');
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(url, body.toString(), { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Créer un nouvel utilisateur
  createUser(userData: any): Observable<any> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
    const headers = this.getAdminHeaders();

    return this.http.post(url, userData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtenir la liste des utilisateurs
  getUsers(): Observable<any[]> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
    const headers = this.getAdminHeaders();

    return this.http.get<any[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  //obtenir les roles d'un user 
  getUserRoles(userId: string): Observable<any[]> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    const headers = this.getAdminHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  // Obtenir la liste des rôles
  getRoles(): Observable<any[]> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/roles`;
    const headers = this.getAdminHeaders();

    return this.http.get<any[]>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching roles:', error);
        return throwError(() => new Error('Failed to load roles. Please check your permissions.'));
      })
    );
  }

  // Assigner un rôle à un utilisateur
  assignRoleToUser(userId: string, role: any): Observable<any> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    const headers = this.getAdminHeaders();

    return this.http.post(url, [role], { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Méthode privée pour obtenir les headers avec le token d'admin
  private getAdminHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
      // Ne pas inclure 'Content-Type' pour les requêtes GET
    });
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  //supprimer user
  deleteUser(userId: string): Observable<any> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;
    const headers = this.getAdminHeaders();
    return this.http.delete(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
}