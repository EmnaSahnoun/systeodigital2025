import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../services/ProjectService';
import { forkJoin, of } from 'rxjs'; // Importer forkJoin et of
import { catchError, map, switchMap } from 'rxjs/operators'; // Importer les opérateurs

export interface ProjectInvitation {
  idProjectAccess: string;
  id: string;
  projectName: string;
  projectId: string;
  invitationDate: string | Date;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED'; // Ou un statut similaire
  // Ajoutez d'autres champs si nécessaire (ex: inviterName)
}
@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls:[ './invitations.component.scss'],
  standalone: false
})
export class InvitationsComponent implements OnInit {

  invitations: ProjectInvitation[] = [];
  filteredInvitations: ProjectInvitation[] = []; // Si vous voulez garder le filtrage
  isLoading: boolean = false;
  userId: string | null = null;
  projects: any[] = [];
  // Pas besoin de viewMode, searchQuery, editing etc. pour l'instant

  constructor(
    private router: Router,
    private projectService: ProjectService, 
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem("user_id");
    if (this.userId) {
      this.getInvitations();
    } else {
      console.error("User ID not found, cannot load invitations.");
      this.snackBar.open('Impossible de charger les invitations: Utilisateur non identifié.', 'Fermer', { duration: 3000 });
    }
  }
  getProjects(){
    const idCompany=localStorage.getItem("idAgence");
    if (idCompany){
      this.projectService.getAllProjects(idCompany).subscribe({
        next: (projects) => {
          this.projects = projects;
          this.fetchInvitationsForProjects();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          this.projects = []; // Vider en cas d'erreur
          this.isLoading = false; // Arrêter le chargement en cas d'erreur
          this.snackBar.open('Erreur lors du chargement des projets associés aux invitations.', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
       
        }
      });
    };
  }
  getInvitations(): void {
    this.isLoading = true;
    this.invitations = [];
    this.getProjects();
  }
  fetchInvitationsForProjects(): void {
    
    if (!this.projects || this.projects.length === 0) {
      this.isLoading = false;
      console.log("Aucun projet trouvé pour chercher des invitations.");
      return;
    }
    
    // Utilisation de forkJoin pour gérer plusieurs appels API
    const requests = this.projects.map(project => 
      this.projectService.getProjectAccessByIdProject(project.id).pipe(
        catchError(err => {
          console.error(`Erreur lors de la récupération des accès pour le projet ${project.id}:`, err);
          return of([]); // Retourne un tableau vide en cas d'erreur
        })
      )
    );

    forkJoin(requests).subscribe({
      next: (accessesArray) => {
        this.invitations = []; // Vider avant de remplir
        
        accessesArray.forEach((accesses, index) => {
          const project = this.projects[index];
          accesses.forEach((access: any) => {
            if (access.idUser === this.userId && access.invitationStatus === "PENDING") {
              this.invitations.push({
                id: access.id,
                projectId: access.projectId,
                projectName: project.name,
                invitationDate: access.createdAt,
                status: 'PENDING',
                idProjectAccess: access.id
              });
            }
          });
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des accès:', err);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des invitations.', 'Fermer', { duration: 3000 });
      }
    });
  }


  acceptInvitation(invitation: ProjectInvitation): void {
    this.isLoading = true;
    this.projectService.updateProjectAccess(invitation.idProjectAccess, "ACCEPTED").subscribe({     
      next: () => {
        this.isLoading = false;
         this.getInvitations(); // Recharger la liste pour enlever l'invitation acceptée
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Erreur lors de l'acceptation:", err);
           }
    });
  }

  refuseInvitation(invitation: ProjectInvitation): void {
    this.isLoading = true;
    this.projectService.updateProjectAccess(invitation.idProjectAccess, "REJECTED").subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Invitation pour "${invitation.projectName}" refusée.`, 'Fermer', { duration: 3000 });
        this.getInvitations(); // Recharger la liste pour enlever l'invitation refusée
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Erreur lors du refus:", err);
        this.snackBar.open("Échec du refus de l'invitation.", 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

}
