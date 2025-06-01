import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserService } from './UserService';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
    private apiUrl = '/agence';
    private projetUrl="/projet"
    constructor(private http: HttpClient, private authService: AuthService, private userService:UserService) { }

    getAllProjects(idCompany:string): Observable<any[]> {
        
        return this.http.get<any[]>(`${this.projetUrl}/project/company/${idCompany}`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
    
    getProjectById(idProjet:string): Observable<any[]> {
        
        return this.http.get<any>(`${this.projetUrl}/project/${idProjet}`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
    createProject(projectData: any): Observable<any> {
        const url = `${this.projetUrl}/project`;
        const headers = this.getApiHeaders();
      
        return this.http.post(url, projectData, { headers }).pipe(
          catchError(this.handleError)
        );
      }
      updateProject(idProject: string, projectData: any): Observable<any> {
        const data = {
            ...projectData,
            id: idProject // On s'assure que l'ID est bien inclus
        };
    
        return this.http.put(`${this.projetUrl}/project/${idProject}`, data, {
            headers: this.getApiHeaders()
        }).pipe(
            catchError(this.handleError)
        );
    }
    deleteProject(idProject: string): Observable<any> {
      
      const updateData = { deleted: true };
      
      return this.http.put(`${this.projetUrl}/project/${idProject}`, updateData, {
          headers: this.getApiHeaders()
      }).pipe(
          catchError(error => {
              console.error('Erreur lors de la suppression logique:', error);
              return throwError(() => new Error('Échec de la suppression logique du projet'));
          })
      );
  }

      createProjectAccess(projectAccessData: any): Observable<any> {
        const url = `${this.projetUrl}/project-accesses`;
        const headers = this.getApiHeaders();
      
        return this.http.post(url, projectAccessData, { headers }).pipe(
          catchError(this.handleError)
        );
      }
      updateProjectAccess(idProjectAccess: string, status: string) {
        const url = `${this.projetUrl}/project-accesses/${idProjectAccess}/status?status=${status}`;
        return this.http.patch(url, {}, {
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
      createPhase(phaseData: any): Observable<any> {
        const url = `${this.projetUrl}/phase`;
        const headers = this.getApiHeaders();
      
        return this.http.post(url, phaseData, { headers }).pipe(
          catchError(this.handleError)
        );
      }
      deletePhase(idPhase: string): Observable<any> {
      
        const url = `${this.projetUrl}/phase/${idPhase}`;
        const headers = this.getApiHeaders();
        
        return this.http.delete(url, { headers }).pipe(
            tap(() => console.log(`Phase ${idPhase} supprimée`)),
            catchError(this.handleError)
        );
    }
    updatePhase(idPhase: string, phaseData: any): Observable<any> {
      const data = {
          ...phaseData,
          id: idPhase // On s'assure que l'ID est bien inclus
      };
  
      return this.http.put(`${this.projetUrl}/phase/${idPhase}`, data, {
          headers: this.getApiHeaders()
      }).pipe(
          catchError(this.handleError)
      );
  }
      getProjectAccessByIdProject(idproject:string): Observable<any[]> {
        return this.http.get<any[]>(`${this.projetUrl}/project-accesses/project/${idproject}`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
      deleteProjectAccess(idProjectAccess: string): Observable<any> {
        const url = `${this.projetUrl}/project-accesses/${idProjectAccess}`;
        const headers = this.getApiHeaders();
        
        return this.http.delete(url, { headers }).pipe(
            tap(() => console.log(`ProjectAccess ${idProjectAccess} supprimé`)),
            catchError(this.handleError)
        );
      }
   
      getphaseByIdProject(idProject:string): Observable<any> {
        
        return this.http.get<any>(`${this.projetUrl}/phase/project/${idProject}`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
      getphaseById(idphase:string): Observable<any> {
        
        return this.http.get<any>(`${this.projetUrl}/phase/${idphase}`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
      getPhaseAccessByIdPhase(idphase:string): Observable<any[]> {
       
        return this.http.get<any[]>(`${this.projetUrl}/phase-accesses/phase/${idphase}`, { 
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
      updatePhaseAccess(idPhaseAccess: string, canView: boolean) {
        const url = `${this.projetUrl}/phase-accesses/${idPhaseAccess}/view-permission?canView=${canView}`;
        return this.http.patch(url, {}, {
          headers: this.getApiHeaders()
        }).pipe(
          catchError(this.handleError)
        );
      }
      
    getTaskByPhase(idphase:string): Observable<any[]> {
      
      return this.http.get<any[]>(`${this.projetUrl}/task/phase/${idphase}`, { 
        headers: this.getApiHeaders()
      }).pipe(
        catchError(this.handleError)
      );
    }
    getTaskByid(idTask:string): Observable<any> {
      
      return this.http.get<any>(`${this.projetUrl}/task/${idTask}`, { 
        headers: this.getApiHeaders()
      }).pipe(
        catchError(this.handleError)
      );
    }
    createTask(taskData: any): Observable<any> {
      const url = `${this.projetUrl}/task`;
      const headers = this.getApiHeaders();
    
      return this.http.post(url, taskData, { headers }).pipe(
        catchError(this.handleError)
      );
    }
    addSubTask(parentId: string, taskData: any): Observable<any> {
    const url = `${this.projetUrl}/task/${parentId}/subtasks`; // Endpoint basé sur la convention RESTful
    const headers = this.getApiHeaders();
  
    return this.http.post(url, taskData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
    updateTask(idTask: string, taskData: any): Observable<any> {
      const data = {
          ...taskData,
          id: idTask // On s'assure que l'ID est bien inclus
      };
  
      return this.http.put(`${this.projetUrl}/task/${idTask}`, data, {
          headers: this.getApiHeaders()
      }).pipe(
          catchError(this.handleError)
      );
  }

updatestatusTask(idTask: string, status: any) {
  const url = `${this.projetUrl}/task/${idTask}/status?status=${status}`;
  return this.http.patch(url, {}, {
    headers: this.getApiHeaders()
  }).pipe(
    catchError(this.handleError)
  );
} 
    deleteTask(idTask: string): Observable<any> {
      
      const url = `${this.projetUrl}/task/${idTask}`;
      const headers = this.getApiHeaders();
      
      return this.http.delete(url, { headers }).pipe(
          tap(() => console.log(`Tache ${idTask} supprimée`)),
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