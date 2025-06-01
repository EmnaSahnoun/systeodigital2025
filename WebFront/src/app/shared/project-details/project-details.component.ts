import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import * as bootstrap from 'bootstrap';
import { AddMemberComponent } from '../../add-member/add-member.component';
import { ProjectService } from '../../services/ProjectService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PhaseFormComponent } from '../phase-form/phase-form.component';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importer MatSnackBar
import { AgenceService } from '../../services/agenceService';
import { PhaseAccessComponent } from '../phase-access/phase-access.component';
import { ConfirmationDialogComponent } from '../../super-admin/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
  standalone: false
})
export class ProjectDetailsComponent implements OnInit {
  projectId: string | null = null;
  selectedTab: string = 'details';
  selectedPhase: any = null;
  isLoading: boolean = false;
  members: any[] = [];
  phases: any[] = [];
  pendingMembers: any[] = [];
  usersToAdd: any[] = [];
  project = {
    id: '67c8306029b4bfa9328a19b4',
    name: 'Projet Exemple',
    description: 'Description du projet',
    address:"",
    createdAt: '2025-01-01T00:00:00.000Z',
    progress: 60,
    members: [
      { id: '1', name: "Alice", image: "assets/images/alice.jpg" },
      { id: '2', name: "Bob", image: "assets/images/bob.jpg" },
      { id: '3', name: "Charlie", image: "assets/images/charlie.jpg" }
    ],
    phases: [
      {
        id: "67c85299bae88e131703dd8e",
        name: "Étude de Faisabilité",
        description: "Analyse des contraintes techniques et réglementaires.",
        startDate: "2025-01-10T00:00:00.000Z",
        endDate: "2025-02-10T00:00:00.000Z",
        tasks: [
          {
            id: "67c8556dbae88e131703dda4",
            name: "Analyse des contraintes techniques",
            status: "PENDING"
          }
        ],
        members: [{ id: '1', name: "Alice", image: "assets/images/alice.jpg" }]
      },
      {
        id: "67c852e7bae88e131703dd92",
        name: "Conception Détaillée",
        description: "Élaboration des plans détaillés.",
        startDate: "2025-02-15T00:00:00.000Z",
        endDate: "2025-03-20T00:00:00.000Z",
        tasks: [],
        members: [{ id: '2', name: "Bob", image: "assets/images/bob.jpg" }]
      }
    ]
  };
  projet: any = {};
  progressOffset: number = 251.2;
  isEditing: boolean = false;
  editedProjectData: any = {};
  availableMembers: any[] = [];
  editingPhaseId: string | null = null; 
  editedPhaseData: any = {}; 
  expandedPhaseId: string | null = null;
  selectedMember: any = null;
  isAdmin:boolean=false;
  isSuperAdmin:boolean=false;
  completed:number=0;
  nbTasks:number=0;

  constructor(private route: ActivatedRoute, 
    private dialog: MatDialog, 
    private router:Router,
    private projectService:ProjectService,
    private modalService: NgbModal,
    private snackBar: MatSnackBar,
    private agenceService: AgenceService,
    private authService:AuthService
    
  
  ) {}
  

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isSuperAdmin=this.authService.isSuperAdmin();
  this.isAdmin=this.authService.isAdmin();
    //this.project = this.router.getCurrentNavigation()?.extras.state?.['projectData'];
    console.log('Données du projectId :', this.projectId);
    this.calculateProgress();
    this.formatDates();
    this.getProjetById();
    this.loadProjectMembers();
    this.getPhases();
  }
  getProjetById(){
    if (this.projectId){
      this.projectService.getProjectById(this.projectId).subscribe({
        next: (p) => {
          this.projet = p;
          
          this.getProgress(this.projet);
          console.log("le projet",this.projet);
          // Pour chaque projet, récupérer les détails des phases
        
          
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
    };
  }
  getProgress(project:any){
    
    this.completed=0;
    this.nbTasks=0
        this.projectService.getphaseByIdProject(project.id).subscribe({
          next: (phases) => {
            phases.forEach((phase:any) => {
              this.projectService.getTaskByPhase(phase.id).subscribe({
                next: (tasks) => {
                  this.nbTasks+=tasks.length;
                  
                  tasks.forEach((task:any) => {
                    this.projectService.getTaskByid(task.id).subscribe({
                      next: (t) => {
                        if(t.status==="COMPLETED"){
                          this.completed++;
                        }
                        console.log("this.completed",this.completed)
                        console.log("this.nbTasks",this.nbTasks)
                        project.progress=(this.completed/this.nbTasks)*100
                        console.log("le progress",project.progress)
                      },
                      error: (err) => {
                        console.error('Erreur lors de la récupération des projets:', err);
                        
                        
                      }
                    });
                  })
                  
                },
                error: (err) => {
                  console.error('Erreur lors de la récupération des projets:', err);
                  
                  
                }
              });
            })
            console.log("this.completed",this.completed)
            console.log("this.nbTasks",this.nbTasks)
            project.progress=this.completed/this.nbTasks
            console.log("le progress",project.progress)
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des projets:', err);
          
            
          }
        });
      
    
    
  }
  startEdit(): void {
    this.editedProjectData = { ...this.projet }; // Copie pour l'édition
    this.isEditing = true;
  }
  
  cancelEdit(): void {
    this.isEditing = false;
    // Réinitialiser les données éditées (optionnel, mais propre)
    this.editedProjectData = { name: '', description: '' ,address:''};
  }
  
  saveEdit(): void {
    if (!this.projectId || !this.editedProjectData) return;
  
    this.isLoading = true; // Afficher un indicateur de chargement si nécessaire
  
    this.projectService.updateProject(this.projectId, this.editedProjectData).subscribe({
      next: (updatedProject) => {
        this.isLoading = false;
        // Mettre à jour les données locales du projet avec la réponse
        this.projet.name = updatedProject.name; // Assurez-vous que l'API retourne le projet mis à jour
        this.projet.description = updatedProject.description;
        this.projet.address = updatedProject.address;
        this.isEditing = false; // Sortir du mode édition
        this.snackBar.open('Projet mis à jour avec succès!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors de la mise à jour du projet:', err);
        this.snackBar.open(`Erreur: ${err.message || 'Impossible de mettre à jour le projet'}`, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
              }
    });
  }
  
  getPhases(){
    if (this.projectId){
      this.projectService.getphaseByIdProject(this.projectId).subscribe({
        next: (phase) => {
          if(this.isAdmin || this.isSuperAdmin){
            this.phases=phase;
            console.log("les phases",this.phases);
            return;
          }
          

          phase.forEach((p:any) => {
            const idUser=localStorage.getItem("user_id");
            this.projectService.getPhaseAccessByIdPhase(p.id).subscribe({
              next: (phaseAccesses) => {
                console.log("Accès pour la phase ", p.id, ":", phaseAccesses);
                phaseAccesses.forEach(phaseAccess => {
                  if (phaseAccess.idUser ===idUser && phaseAccess.canView===true ){
                    this.phases.push(p);
                    

                  }
                });
                
              },
              error: (err) => {
                console.error("Erreur récupération accès phase", p.id, ":", err);
              }
            });
          });
        
          
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
    };
  }
  addPhase(): void {
    const modalRef = this.modalService.open(PhaseFormComponent, {
        size: 'lg',
        centered: true,
        backdrop: 'static',
        keyboard: false
    });
    
    modalRef.componentInstance.projectId = this.projectId;
    
    modalRef.result.then(
        (result) => {
            if (result) {
                console.log('Nouvelle phase créée:', result);
                this.openPhaseAccesssModal(result);
                this.getPhases();
            }
        },
        (reason) => {
            console.log('Modal fermée avec raison:', reason);
        }
    );
}
    loadProjectMembers(): void {
      this.isLoading = true;
      if (this.projectId) {
          this.projectService.getProjectAccessByIdProject(this.projectId).subscribe({
              next: async (accessList) => {
                  try {
                      // Traitement des membres acceptés
                      const acceptedMembers = accessList
                          .filter(access => access.invitationStatus === 'ACCEPTED');
                      
                      // Tableau pour stocker les membres avec données complètes
                      this.members = [];
                      
                      // Récupération des données pour chaque membre
                      for (const access of acceptedMembers) {
                          try {
                              const userData = await this.agenceService.getUserById(access.idUser).toPromise();
                              this.members.push({
                                  id: access.idUser,
                                  name: `${userData.firstName} ${userData.lastName}`,
                                  email: userData.email,
                                  role: access.role,
                                  username: access.username,
                                  // Ajoutez d'autres champs si nécessaire
                                  ...userData
                              });
                          } catch (error) {
                              console.error(`Erreur lors de la récupération de ${access.username}:`, error);
                              // Ajouter quand même les données de base si échec
                              this.members.push({
                                  id: access.idUser,
                                  name: access.username,
                                  email: access.emailUser,
                                  role: access.role,
                                  username: access.username
                              });
                          }
                      }
  
                      // Traitement des invitations en attente
                      this.pendingMembers = accessList
                          .filter(access => access.invitationStatus === 'PENDING')
                          .map(pending => ({
                              id: pending.id,
                              idUser: pending.idUser,
                              emailUser: pending.emailUser,
                              role: pending.role,
                              createdAt: pending.createdAt,
                              username: pending.username
                          }));
  
                      console.log('Members with full data:', this.members);
                      this.isLoading = false;
                  } catch (error) {
                      console.error('Error processing members:', error);
                      this.isLoading = false;
                  }
              },
              error: (err) => {
                  console.error('Error loading members:', err);
                  this.isLoading = false;
              }
          });
      }
  }

  private formatDates() {
    this.project.phases.forEach(phase => {
      phase.startDate = this.formatDate(phase.startDate);
      phase.endDate = this.formatDate(phase.endDate);
    });
    this.project.createdAt = this.formatDate(this.project.createdAt);
  }
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
 
  changeTab(tab: string) {
    this.selectedTab = tab;
  }

  calculateProgress() {
    const progress = this.projet?.progress || 0;
    this.progressOffset = 251.2 * ( progress / 100);
  
  }
  getProgressOffset(): number {
    const progress = this.projet?.progress;
    const validProgress = isNaN(progress) || progress === null ? 0 : Math.min(100, Math.max(0, progress));
    return 251.2 - (251.2 * validProgress / 100);
  }
  
  getDisplayProgress(): string {
    const progress = this.projet?.progress;
    return isNaN(progress) || progress === null ? '0%' : `${Math.round(progress)}%`;
  }
  editPhase(phase: any) :void{
    console.log("Modifier la phase:", phase.id);
    this.editingPhaseId = phase.id;
    this.editedPhaseData = {
      ...phase,
      // Convertir les dates en format YYYY-MM-DD pour input type="date"
      startDate: this.formatDateForInput(phase.startDate),
      endDate: this.formatDateForInput(phase.endDate)
     };
    this.expandedPhaseId = null; // Referme la description si elle était ouverte
    console.log('Start editing phase:', this.editedPhaseData);
  }
  savePhaseEdit(): void {
    if (!this.editingPhaseId) return;
    console.log("dans la fonction save phase Edit",this.editingPhaseId)
    this.isLoading = true;
    const phaseDataToSend = {
      name: this.editedPhaseData.name,
      description: this.editedPhaseData.description,
      address: this.editedPhaseData.address,
      startDate: this.formatDateForApi(this.editedPhaseData.startDate), // Format YYYY-MM-DD ou ISO
      endDate: this.formatDateForApi(this.editedPhaseData.endDate),     // Format YYYY-MM-DD ou ISO
      projectId: this.projet.id // Assurez-vous que projectId est inclus
    };

    console.log('Saving phase data for ID:', this.editingPhaseId, phaseDataToSend);

    this.projectService.updatePhase(this.editingPhaseId, phaseDataToSend).subscribe({
      next: (updatedPhase) => {
        console.log('Phase updated successfully', updatedPhase);
        const index = this.phases.findIndex(p => p.id === this.editingPhaseId);
        if (index !== -1) {
          // Mettre à jour le tableau local avec les nouvelles données (potentiellement re-formater les dates pour l'affichage)
          this.phases[index] = { ...this.phases[index], ...updatedPhase };
        }
        this.snackBar.open('Phase mise à jour avec succès!', 'Fermer', { duration: 3000 });
        this.cancelPhaseEdit(); // Quitter le mode édition
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating phase:', err);
        this.snackBar.open(`Erreur lors de la mise à jour: ${err.message || 'Erreur inconnue'}`, 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
  cancelPhaseEdit(): void {
    this.editingPhaseId = null;
    this.editedPhaseData = {};
  }
  private formatDateForInput(dateSource: string | Date): string {
    if (!dateSource) return '';
    try {
        const date = new Date(dateSource);
        if (isNaN(date.getTime())) return ''; // Gère les dates invalides
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date for input:", dateSource, e);
        return '';
    }
  }

  // Formate une date (provenant de l'input YYYY-MM-DD) pour l'API
  // Adaptez ceci si votre API attend un format ISO string
  private formatDateForApi(dateString: string): string {
    // Si l'API attend YYYY-MM-DD, on retourne la chaîne telle quelle.
    // Si l'API attend un ISO string: new Date(dateString).toISOString(); (attention aux fuseaux horaires)
    return dateString;
  }
  deletePhase(phase: any) {

    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
            centered: true,
            windowClass: 'confirmation-modal'
        });
    
        modalRef.componentInstance.message = `Voulez-vous vraiment supprimer la phase `;
        modalRef.componentInstance.username = phase.name; // Pass username for confirmation if needed
    
        modalRef.result.then((confirm) => {
            if (confirm) {
              this.projectService.deletePhase(phase.id).subscribe({
                next: () => {
                  this.getPhases();
                    
                  this.isLoading = false;
              },
              error: (err) => {
                  console.error('Erreur lors de la suppression:', err);
                  this.snackBar.open('Échec du retrait du membre', 'Fermer', { 
                      duration: 5000,
                      panelClass: ['error-snackbar'] 
                  });
                  this.isLoading = false;
              }
          });
            }
        }).catch(() => {
            console.log('Suppression annulée');
        });



    
  }
 openMemberModal(phase: any): void {
  this.selectedPhase = phase;  // Sélectionner la phase
  this.availableMembers = this.project.members.filter(member => 
    !phase.members.some((phaseMember:any) => phaseMember.id === member.id)
  ); // Filtrer les membres déjà assignés à la phase

  // Ouvrir le modal avec les membres disponibles et la phase sélectionnée
  const dialogRef = this.dialog.open(AddMemberComponent, {
    data: {  phase: this.selectedPhase }
  });

  // Quand un membre est ajouté dans le modal
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Mettre à jour la phase dans le projet avec le membre ajouté
      this.selectedPhase.members.push(result);
    }
  });
} 
openPhaseAccesssModal(phase: any): void {
  const modalRef = this.modalService.open(PhaseAccessComponent, {
    size: 'lg',
    centered: true,
    backdrop: 'static',
    keyboard: false
  });

  // Passez les données via componentInstance
  modalRef.componentInstance.phase = phase;

  modalRef.result.then(
    (result) => console.log('Modal closed', result),
    (reason) => console.log('Modal dismissed', reason)
  );
}
openTasks(phase: any): void {
  if (this.expandedPhaseId === null) {
    console.log('Ouvrir les tâches pour la phase:', phase.name);
   
  this.router.navigate(['project', this.projet.id, 'phase', phase.id],
    {state:{phaseData:phase,
      projectData:this.projet
    }}
  );
}}
togglePhaseExpansion(phaseId: string): void {
  if (this.expandedPhaseId === phaseId) {
    this.expandedPhaseId = null; // Si déjà étendue, on la réduit
  } else {
    this.expandedPhaseId = phaseId; // Sinon, on étend celle-ci
  }
  console.log("Expanded Phase ID:", this.expandedPhaseId); // Pour le débogage
}
}