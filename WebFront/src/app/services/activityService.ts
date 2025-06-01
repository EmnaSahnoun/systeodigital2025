import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';
import { CommentResponse, TaskHistory } from '../models/activity.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
    private apiUrl = '/activity';
    
    constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }

    getCommentsByTaskId(idTask: string): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/comments/task/${idTask}`, { 
        headers: this.getApiHeaders()
    }).pipe(
        catchError(this.handleError)
    );
}

      addComment(commentData: any): Observable<CommentResponse> {
    const url = `${this.apiUrl}/comments`;
    const headers = this.getApiHeaders();
    
    return this.http.post<CommentResponse>(url, commentData, { headers }).pipe(
        catchError(this.handleError)
    );
}

      updateComment(idComment: string, commentData: any): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(`${this.apiUrl}/comments/${idComment}`, commentData, {
        headers: this.getApiHeaders()
    }).pipe(
        catchError(this.handleError)
    );}
    deleteComment(commentId: string, taskId: string, userId: string): Observable<void> {
        const params = new HttpParams()
    .set('taskId', taskId)
    .set('idUser', userId);
      return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`, {
    headers: this.getApiHeaders(),
    params: params
  }).pipe(
    catchError(this.handleError)
  );
    }
    getHistoryByTaskId(idTask: string): Observable<TaskHistory[]> {        
    return this.http.get<TaskHistory[]>(`${this.apiUrl}/history/task/${idTask}`, { 
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