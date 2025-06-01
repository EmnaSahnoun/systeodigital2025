import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { catchError, Observable, Subject, throwError, of } from 'rxjs';
import { Notification } from '../models/notification.model'; // Importer l'interface

import { EventSourcePolyfill } from 'event-source-polyfill';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
private apiUrl = '/notification';
  private eventSource: EventSourcePolyfill | null = null;
  private notificationsSubject = new Subject<any>();
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Récupérer les notifications en attente
  getPendingNotifications(userId: string): Observable<any[]> {
    const headers = this.getApiHeaders().set('X-User-ID', userId);
    return this.http.get<any[]>(`${this.apiUrl}/pending`, { headers })
      .pipe(
        // catchError(this.handleError) // Décommentez si vous voulez gérer les erreurs ici
      );
  }

  // Établir la connexion SSE et retourner un Observable
  connectToNotificationStream(userId: string): Observable<any> {
    // Fermer la connexion existante si elle existe
    if (this.eventSource) {
      this.eventSource.close();
    }

    // Créer les headers pour SSE
    const headers = {
      'X-User-ID': userId,
      'Authorization': `Bearer ${this.authService.getAccessToken()}`
    };

    // Créer une nouvelle connexion SSE
    this.eventSource = new EventSourcePolyfill(`${this.apiUrl}/stream`, { headers });

    // Gérer les événements
    this.eventSource.addEventListener('comment-notification', (event: any) => {
      try {
        const notification = JSON.parse(event.data);
        this.notificationsSubject.next(notification);
      } catch (e) {
        console.error('Error parsing notification data:', e);
        this.notificationsSubject.error(e);
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.notificationsSubject.error(error);
      
      // Fermer la connexion en cas d'erreur
      this.closeConnection();
    };

    return this.notificationsSubject.asObservable();
  }

  // Fermer la connexion
  closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Envoyer une notification de test (pour debug)
  sendTestNotification(notification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-notification`, notification, { 
      headers: this.getApiHeaders() 
    }).pipe(
      // catchError(this.handleError) // Décommentez si vous voulez gérer les erreurs ici
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
