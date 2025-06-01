import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
     private apiUrl = '/document';
     constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }
      
       // Upload a media file with metadata
  uploadFile(
    file: File,
    description: string,
    taskId: string,
    projectId: string | null,
    phaseId: string | null,
    uploadedBy: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('taskId', taskId);
    
    if (projectId) {
      formData.append('projectId', projectId);
    }
    
    if (phaseId) {
      formData.append('phaseId', phaseId);
    }
    
    const headers = this.getApiHeaders().delete('Content-Type'); // Let browser set content-type with boundary

    return this.http.post(`${this.apiUrl}/media`, formData, { 
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Download a media file
  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/media/${id}`, {
      headers: this.getApiHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get all media files for a task
  getFilesByTask(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/media/task/${taskId}`, { 
      headers: this.getApiHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a media file
  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/media/${id}`, { 
      headers: this.getApiHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
     
     
     private getApiHeaders(): HttpHeaders {
        const token = this.authService.getAccessToken();
        const username=localStorage.getItem("username")
        return new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-ID': username || ''
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