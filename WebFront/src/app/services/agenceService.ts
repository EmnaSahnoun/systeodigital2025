import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgenceService {
    private apiUrl = '/agence';
    private realm = 'systeodigital';
    private keycloakUrl = '/api';   
    
    constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }
  // Méthode pour créer une agence
  createAgence(agence: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getAccessToken()}`,
      'Accept': 'application/json'
    });
  
    return this.http.post(`${this.apiUrl}/create`, agence, { 
      headers: headers,
      withCredentials: true // Important pour les requêtes avec credentials
    }).pipe(
      catchError(error => {
        console.error('Error details:', error);
        return throwError(() => new Error(
          error.error?.message || 
          error.message || 
          'Une erreur est survenue'
        ));
      })
    );
  }
  // Méthode pour mettre à jour une agence
  updateAgence(id: string, agence: any): Observable<any> {
    const fullAgenceData = {
        ...agence,
        id: id // On s'assure que l'ID est bien inclus
    };

    return this.http.put(`${this.apiUrl}/update/${id}`, fullAgenceData, {
        headers: this.getApiHeaders()
    }).pipe(
        catchError(this.handleError)
    );
}
    getAllAgencies(): Observable<any[]> {
      console.log("l'url",`${this.apiUrl}/all`);
      return this.http.get<any[]>(`${this.apiUrl}/all`, { 
        headers: this.getApiHeaders()
      }).pipe(
        catchError(this.handleError)
      );
    }
  
    getIdGroup(name: string): Observable<string> {
      const headers = this.getApiHeaders();
      return this.http.get<any[]>(`${this.keycloakUrl}/admin/realms/${this.realm}/groups?search=${encodeURIComponent(name)}`, { headers })
          .pipe(
              map(groups => {
                  const group = groups.find(g => g.name === name);
                  if (!group) {
                      throw new Error(`Groupe "${name}" introuvable`);
                  }
                  return group.id;
              }),
              catchError(this.handleError)
          );
  }
  getGroupMembers(groupId: string): Observable<any[]> {
    const headers = this.getApiHeaders();
    return this.http.get<any[]>(`${this.keycloakUrl}/admin/realms/${this.realm}/groups/${groupId}/members`, { headers })
        .pipe(
            catchError(this.handleError)
        );
}
getMembersByGroupName(groupName: string): Observable<any[]> {
  return this.getIdGroup(groupName).pipe(
      switchMap(groupId => this.getGroupMembers(groupId))
  );
}
  getUsers(id:string):Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/groups/${id}/members`,).pipe(
      catchError(this.handleError)
    );
  }

  //ajouter user a un groupe
  addUserToGroup(userId: string, groupId: string): Observable<any> {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/groups/${groupId}`;
    const headers = this.getApiHeaders();
    
    return this.http.put(url, null, { headers }).pipe(
        catchError(this.handleError)
    );
}
// Trouver un utilisateur par son username
getUserByUsername(username: string): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users?username=${encodeURIComponent(username)}`;
  const headers = this.getApiHeaders();
  
  return this.http.get<any[]>(url, { headers }).pipe(
      map(users => {
          const user = users.find(u => u.username === username);
          if (!user) {
              throw new Error('Utilisateur non trouvé');
          }
          return user;
      }),
      catchError(this.handleError)
  );
}
getUserById(id: string): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${id}`;
  const headers = this.getApiHeaders();

  return this.http.get<any>(url, { headers }).pipe(
    catchError(this.handleError)
  );
}

// Créer un nouvel utilisateur
createUser(userData: any): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
  const headers = this.getApiHeaders();

  return this.http.post(url, userData, { headers }).pipe(
    catchError(this.handleError)
  );
}
// Assigner un rôle à un utilisateur
assignRoleToUser(userId: string, role: any): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
  const headers = this.getApiHeaders();

  return this.http.post(url, [role], { headers }).pipe(
    catchError(this.handleError)
  );
}
// Méthode complète pour créer un utilisateur avec rôle et groupe
createUserWithRoleAndGroup(userData: any, roleName: string, groupName: string): Observable<any> {
  if (!groupName) {
      return throwError(() => new Error('Le nom du groupe est requis'));
  }

  console.log('Début de création utilisateur avec:', { userData, roleName, groupName });

  return this.createUser(userData).pipe(
      tap(() => console.log('Utilisateur créé dans Keycloak')),
      switchMap(() => {
          console.log('Recherche de l\'utilisateur créé par username:', userData.username);
          return this.getUserByUsername(userData.username).pipe(
              catchError(err => {
                  console.error('Erreur lors de la recherche utilisateur:', err);
                  return throwError(() => new Error('Impossible de retrouver l\'utilisateur créé'));
              })
          );
      }),
      switchMap(user => {
          console.log('Utilisateur trouvé, ID:', user.id);
          
          return this.userService.getRoles().pipe(
              switchMap(roles => {
                  const role = roles.find(r => r.name === roleName);
                  if (!role) {
                      return throwError(() => new Error(`Rôle ${roleName} introuvable`));
                  }

                  const assignRole$ = this.assignRoleToUser(user.id, role).pipe(
                      tap(() => console.log(`Rôle ${roleName} assigné avec succès`)),
                      catchError(err => {
                          console.error('Erreur assignation rôle:', err);
                          return throwError(() => new Error('Échec assignation rôle'));
                      })
                  );

                  const assignGroup$ = this.getIdGroup(groupName).pipe(
                      tap(groupId => console.log('ID du groupe trouvé:', groupId)),
                      switchMap(groupId => this.addUserToGroup(user.id, groupId).pipe(
                          tap(() => console.log('Utilisateur ajouté au groupe')),
                          catchError(err => {
                              console.error('Erreur ajout au groupe:', err);
                              return throwError(() => new Error('Échec ajout au groupe'));
                          })
                      ))
                  );

                  return forkJoin([assignRole$, assignGroup$]);
              }),
              catchError(err => {
                  console.error('Erreur lors de la récupération des rôles:', err);
                  return throwError(() => new Error('Échec de la récupération des rôles'));
              })
          );
      }),
      catchError(error => {
          console.error('Erreur globale dans createUserWithRoleAndGroup:', error);
          return throwError(() => new Error('Échec de la création complète de l\'utilisateur'));
      })
  );
}


deleteUserCompletely(userId: string, groupName: string): Observable<any> {
  if (!userId || !groupName) {
      return throwError(() => new Error('ID utilisateur et nom de groupe requis'));
  }

  console.log(`Début suppression utilisateur ${userId} du groupe ${groupName}`);

  return this.getIdGroup(groupName).pipe(
      switchMap(groupId => {
          // 1. D'abord retirer l'utilisateur du groupe
          return this.removeUserFromGroup(userId, groupId).pipe(
              tap(() => console.log(`Utilisateur retiré du groupe ${groupId}`)),
              // 2. Ensuite supprimer l'utilisateur
              switchMap(() => this.deleteUser(userId)),
              catchError(err => {
                  console.error('Erreur lors du retrait du groupe', err);
                  return throwError(() => new Error('Échec du retrait du groupe'));
              })
          );
      }),
      catchError(error => {
          console.error('Erreur globale dans deleteUserCompletely:', error);
          return throwError(() => new Error('Échec de la suppression complète'));
      })
  );
}

// Retire un utilisateur d'un groupe Keycloak

removeUserFromGroup(userId: string, groupId: string): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/groups/${groupId}`;
  const headers = this.getApiHeaders();
  
  return this.http.delete(url, { headers }).pipe(
      catchError(this.handleError)
  );
}

//Supprime définitivement un utilisateur Keycloak
deleteUser(userId: string): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;
  const headers = this.getApiHeaders();
  
  return this.http.delete(url, { headers }).pipe(
      tap(() => console.log(`Utilisateur ${userId} supprimé`)),
      catchError(this.handleError)
  );
}
updateUser(
  userId: string,
  userData: {
    id?: string,
    username: string,
    firstName?: string,
    lastName?: string,
    email: string,
    enabled?: boolean
  },
  options?: {
    partialUpdate?: boolean,
    enabled?: boolean
  }
): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;
  const headers = this.getApiHeaders();

  // Si partialUpdate est true, on récupère d'abord les données existantes
  if (options?.partialUpdate) {
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError),
      switchMap(existingUser => {
        const payload = {
          ...existingUser, // Conserve toutes les propriétés existantes
          ...userData,     // Écrase avec les nouvelles valeurs
          id: userId,     // Garantit que l'ID est correct
          enabled: options?.enabled !== undefined 
            ? options.enabled 
            : userData.enabled !== undefined 
              ? userData.enabled 
              : existingUser.enabled
        };

        return this.http.put(url, payload, { headers }).pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  // Pour une mise à jour complète (non partielle)
  const payload = {
    ...userData,
    id: userId,
    username: userData.username,
    email: userData.email,
    enabled: options?.enabled !== undefined 
      ? options.enabled 
      : userData.enabled !== undefined 
        ? userData.enabled 
        : true
  };

  return this.http.put(url, payload, { headers }).pipe(
    catchError(this.handleError)
  );
}

// Méthode pour supprimer une agence
deleteAgence(id: string, authToken: string): Observable<void> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });

  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
    .pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression:', error);
        return throwError(() => new Error('Échec de la suppression de l\'agence'));
      })
    );
}

getAgenceByUser(idUser: string): Observable<any> {
  const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${idUser}/groups`;
  const headers = this.getApiHeaders();
  
 
    return this.http.get<any[]>(url, { headers })
        .pipe(
            catchError(this.handleError)
        );
}
getAgenceByName(name: string){
  return this.http.get<any>(`${this.apiUrl}/name/${name}`, { 
    headers: this.getApiHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}
  private getApiHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
    private handleError(error: HttpErrorResponse): Observable<never> {
      console.error('API Error Details:', error);
      
      let errorMessage = 'Une erreur est survenue';
      if (error.status === 401) {
        errorMessage = 'Session expirée - veuillez vous reconnecter';
        this.authService.logout();
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 500) {
        errorMessage = `Erreur serveur (${error.status}) - ${error.error?.error || 'Veuillez contacter l\'administrateur'}`;
      }
  
      return throwError(() => new Error(errorMessage));
    }
}
