import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Invoice } from '../models/invoice';
import { AuthService } from './auth.service';
import { UserService } from './UserService';
import { Client } from '../clients/clients.component';


@Injectable({
  providedIn: 'root'
})
export class CommercialService {
  // Adjust the baseUrl to your actual API endpoint

 private apiUrl = '/commercial';
 private apiKeycloak="/api"
  constructor(private http: HttpClient, 
    private authService: AuthService, 
    private userService:UserService) { }

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/commercialdocuments`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/commercialdocuments/${id}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  createInvoice(invoicePayload: any): Observable<Invoice> {
   
    return this.http.post<Invoice>(`${this.apiUrl}/commercialdocuments`, invoicePayload, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  updateInvoice(id: any, invoicePayload: any): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/commercialdocuments/${id}`, invoicePayload, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commercialdocuments/${id}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  getClients(idCompany:string): Observable<any[]> {
    console.log("headezrrs",this.getApiHeaders())
    return this.http.get<any[]>(`${this.apiUrl}/client/company/${idCompany}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }
  createClient(clientData: any): Observable<any> {
    console.log("headezrrs",this.getApiHeaders())
    return this.http.post<any>(`${this.apiUrl}/client`, clientData, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }
getClientById(idClient:string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/client/${idClient}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }
  updateClient(idClient: string, clientData: any): Observable<any> {
    
    return this.http.put<any>(`${this.apiUrl}/client/${idClient}`, clientData,  { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );    
  }
   deleteClient(idClient: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/client/${idClient}`, { 
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError));
  }

  checkKeycloakCredentials(idUser: string): Observable<boolean> {
    const credentialsUrl =`${this.apiKeycloak}/admin/realms/systeodigital/users/${idUser}/credentials`;
  return this.http.get<any[]>(credentialsUrl
    ,
    { headers: this.getApiHeaders() }
  ).pipe(
    map(credentials => {
      return credentials && credentials.length > 0;
    }),
    catchError(err => {
      console.error('Erreur lors de la récupération des credentials', err);
      return of(false); // En cas d'erreur, on suppose qu’il n’y a pas de mot de passe
    })
  );
}

setKeycloakPassword(userId: string, passwordDetails: any): Observable<void> {
   const resetPasswordUrl = `${this.apiKeycloak}/admin/realms/systeodigital/users/${userId}/reset-password`;
return this.http.put<void>(resetPasswordUrl, passwordDetails, { headers: this.getApiHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error setting Keycloak password for user ${userId}:`, error);
        // Vous pouvez personnaliser la gestion des erreurs ici.
        // Par exemple, extraire un message d'erreur plus spécifique de la réponse de Keycloak si disponible.
        let errorMessage = 'An unknown error occurred while setting the password.';
        if (error.error && typeof error.error.errorMessage === 'string') {
          errorMessage = error.error.errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage)); // Propage l'erreur pour que le composant appelant puisse la gérer
      })
    );
  }

   private getApiHeaders(): HttpHeaders {
         const token = this.authService.getAccessToken();
         return new HttpHeaders({
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
           'Scope': 'roles'
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
