import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgenceService } from '../../services/agenceService'; // Service pour récupérer les utilisateurs
import { ProjectService } from '../../services/ProjectService'; // Service pour gérer les accès projet
import { catchError, forkJoin, map, of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
export interface ProjectAccessData {
  projectId: string;
  agenceId: string; // ID de l'agence pour récupérer les utilisateurs
  currentAccess: { userId: string, canView: boolean }[]; // Accès actuels pour pré-remplir
}

// Interface pour représenter un utilisateur avec son état d'accès
export interface UserAccess {
  id: string;
  username: string; // Ou firstName + lastName
  email: string;
  canView: boolean;
}
@Component({
  selector: 'app-phase-access',
  templateUrl: './phase-access.component.html',
  styleUrl: './phase-access.component.scss',
  standalone: false
})
export class PhaseAccessComponent {
isLoading = false;
allUsers: any[] = []; // Liste complète des utilisateurs avec leurs accès
initialUserStates: Map<string, boolean> = new Map(); // Pour suivre les états initiaux
searchQuery: string = ''; // Pour la recherche/filtrage
filteredUsers: any[] = []; // Utilisateurs filtrés par la recherche
  @Input() phase: any;

  constructor(
    
    public activeModal: NgbActiveModal,

    private agenceService: AgenceService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('Phase:', this.phase);
    this.loadUsersAndAccess();
  }

  loadUsersAndAccess(): void {
    this.isLoading = true;
        this.projectService.getPhaseAccessByIdPhase(this.phase.id).subscribe({
      next: (phaseAccesses) => {
        console.log('Utilisateurs avec accès:', phaseAccesses);
  
        // Créer un tableau pour stocker toutes les requêtes
        const userRequests = phaseAccesses.map((access:any) => 
          this.agenceService.getUserById(access.idUser).pipe(
            map(user => ({
              ...access, // Conserver les données d'accès originales
              id: access.idUser, // Ensure the main ID is the user ID for consistency if needed later
              username: user.username, // Ajouter le username
              email: user.email ,
              canView: access.canView,
          originalCanView: access.canView
            }))
          )
        );
  
        // Exécuter toutes les requêtes en parallèle
        forkJoin(userRequests).subscribe({
          next: (usersWithAccess) => {
            // Maintenant usersWithAccess contient les accès avec les usernames
            console.log('Utilisateurs avec accès:', usersWithAccess);
            this.allUsers = usersWithAccess.map(u => ({

              id: u.idUser, // User ID
              username: u.username || 'N/A', // Provide fallback
              email: u.email || '', // Provide fallback (empty string is safe for .toLowerCase())
              canView: u.canView ,
              idPhaseAccess:phaseAccesses[0].id
            }));
            console.log('Usernames:', this.allUsers);
            
            this.applyFilter();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des utilisateurs:', err);
            this.snackBar.open('Erreur lors de la récupération des détails utilisateurs', 'Fermer', { duration: 3000 });
            this.isLoading = false;
          }
        });
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des accès:', err);
        this.snackBar.open('Erreur lors du chargement des accès', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.activeModal.dismiss();
      }
    });
  }

  applyFilter(): void {
    
    if (!this.searchQuery) {
      this.filteredUsers = [...this.allUsers];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.allUsers.filter(user =>
        (user.username && user.username.toLowerCase().includes(query)) 
     
      );
    }
  }
  onAccessChange(user: UserAccess, newValue: boolean): void {
    // Ici vous pouvez implémenter une sauvegarde immédiate si nécessaire
    console.log(`Accès modifié pour ${user.username}: ${newValue}`);
  }
  
  onSave(): void {
    this.isLoading = true;
    
    const modifiedUsers = this.allUsers.filter(user => 
      user.canView !== user.originalCanView
    );

    if (modifiedUsers.length === 0) {
      this.isLoading = false;
      this.snackBar.open('Aucune modification à sauvegarder', 'Fermer', { 
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    const updateRequests = modifiedUsers.map(user => 
      this.projectService.updatePhaseAccess(user.idPhaseAccess, user.canView).pipe(
        map(() => ({ success: true, idPhaseAccess: user.idPhaseAccess })),
        
        catchError(error => of({ 
          success: false, 
          idPhaseAccess: user.idPhaseAccess,
          error: error.message 
        }))
      ),
    
    )
    ;

    forkJoin(updateRequests).subscribe({
      next: (results) => {
        const failedUpdates = results.filter(r => !r.success);
        
        if (failedUpdates.length === 0) {
          modifiedUsers.forEach(user => user.originalCanView = user.canView);
          this.snackBar.open('Modifications sauvegardées', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.activeModal.dismiss();
        } else {
          this.snackBar.open(
            `${failedUpdates.length} erreur(s) lors de la sauvegarde`,
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.activeModal.dismiss(); // Fermer sans sauvegarder
  }

  // Optionnel: Pour suivre les éléments dans *ngFor pour de meilleures performances
  trackByUser(index: number, item: UserAccess): string {
    return item.id;
  }
}
