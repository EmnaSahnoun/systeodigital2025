import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/ProjectService';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'; // <-- Importer MatDialog
import { ProjectFormComponent } from '../project-form/project-form.component'; // <-- Importer le composant formulaire
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Phase } from '../../models/phase.model';
import { ProjectMembersComponent } from '../project-members/project-members.component'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
export interface Project {
  id: string; // Or number, depending on your backend
  name: string;
  address:string;
  createdAt: string | Date;
  minStartDate: string | Date | null;
  maxEndDate: string | Date | null;
  progress: number;
  status: string;
  members?: any[]; // Define a Member interface if possible
  phases?: any[]; // Define a Phase interface if possible
  description?: string; // Add other editable fields
  // Add other relevant project properties
}
@Component({
  
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  standalone: false
})
export class ProjectsComponent implements OnInit{
  currentDate: string;
  searchQuery: string = '';
  viewMode: 'list' | 'card' = 'card'; // Default view mode is list
  projects: any[] = [];
  filteredProjects: any[] = [];
  members: any[] = [];
  isLoading: boolean = false;
  editingProjectId: string | null = null; // Track the ID of the project being edited
  editedProjectData: Partial<Project> = {}; // Holds the data being edited
  
  isUser:boolean=false;
  isAdmin:boolean=false;
  isSuperAdmin:boolean=false;

  completed:number=0;
  nbTasks:number=0;
  constructor(
    private modalService: NgbModal,
    private router: Router
    ,private projectService:ProjectService,
    public dialog: MatDialog ,
    private snackBar: MatSnackBar,
private authService:AuthService,
    

  ) { 
    this.currentDate = new Date().toLocaleDateString(); 
    
  }

  ngOnInit(): void {
    this.isUser=this.authService.isUser();
  this.isSuperAdmin=this.authService.isSuperAdmin();
  this.isAdmin=this.authService.isAdmin();
    this.getProjects();    
  }

  // Toggle view mode
  toggleViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }
  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredProjects = [...this.projects]; // Use spread operator for a new array instance
    } else {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      this.filteredProjects = this.projects.filter(project =>
        project.name.toLowerCase().includes(lowerCaseQuery)
      );
    }
   }
   getProjects(){
    const idCompany=localStorage.getItem("idAgence");
    if (idCompany){
      this.projectService.getAllProjects(idCompany).subscribe({
        next: (projects) => {
          
          projects.forEach(project => {
            this.getDates(project);
            this.checkProjectStatus(project);
          }); 
          
          
          
          if(this.isUser){
            
            const idUser=localStorage.getItem("user_id");
            //this.projects=this.projects.filter(p => p.idAdmin === idUser);
            
            projects.filter(p => p.deleted !== true);
            console.log("les projets apres le 1er filtrage",projects);
            projects.forEach(projet => {
              this.projectService.getProjectAccessByIdProject(projet.id).subscribe({
                next: (projectAccesses) => {
                  console.log("Accès pour le projet", projet.id, ":", projectAccesses);
                  projectAccesses.forEach(projectAccess => {
                    console.log("projectAccess.idUser ===idUser",projectAccess.idUser ===idUser)
                    console.log("projectAccess.invitationStatus===",projectAccess.invitationStatus==="ACCEPTED")
                    if (projectAccess.idUser ===idUser && projectAccess.invitationStatus==="ACCEPTED" ){
                      this.projects.push(projet); 
                      console.log("les projets de user",this.projects);                     
                    }
                  });
                  
                  this.projects.forEach((projet:any) => {
                    this.getProgress(projet);
                  })
                  console.log("les projets de user",this.projects)
                  this.applyFilter();
                },
                error: (err) => {
                  console.error("Erreur récupération accès projet", projet.id, ":", err);
                }
              });
            });
          } 
          else if(this.isAdmin){
            console.log("les projets de user",projects)
            this.projects = projects.filter(p => p.deleted !== true);
            this.projects.forEach((projet:any) => {
              this.getProgress(projet);
            })
            console.log("les projets de user",this.projects)
            this.applyFilter();
          }   
          else{
            this.projects = projects.filter(p => p.deleted !== true);
            this.projects.forEach((projet:any) => {
              this.getProgress(projet);
            })
            this.applyFilter();
          }        
          console.log("les projets",this.projects);
        
          
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          this.projects = []; 
          this.applyFilter(); 
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
                        
                        project.progress=(this.completed/this.nbTasks)*100
                        
                      },
                      error: (err) => {
                        console.error('Erreur lors de la récupération des projets:', err);
                        this.projects = []; 
                        
                      }
                    });
                  })
                  
                },
                error: (err) => {
                  console.error('Erreur lors de la récupération des projets:', err);
                  this.projects = [];
                  
                }
              });
            })
            
            project.progress=this.completed/this.nbTasks
            
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des projets:', err);
            this.projects = []; 
            
          }
        });
      
    
    
  }
  getDates(project: any) {
    project.minStartDate = null;
    project.maxEndDate = null;
    project.phases = []; 
  
    if (project.phaseIds && project.phaseIds.length > 0) {
      const phaseRequests = project.phaseIds.map((phaseId: string) => 
        this.projectService.getphaseById(phaseId)
      );
  
      // Spécifier le type générique pour forkJoin
      forkJoin<Phase[]>(phaseRequests).subscribe({
        next: (phases) => {
          project.phases = phases;
          
          // Calculer les dates min/max
          phases.forEach((phase: Phase) => {
            const phaseStartDate = new Date(phase.startDate);
            const phaseEndDate = new Date(phase.endDate);
  
            if (!project.minStartDate || phaseStartDate < project.minStartDate) {
              project.minStartDate = phaseStartDate;
            }
            
            if (!project.maxEndDate || phaseEndDate > project.maxEndDate) {
              project.maxEndDate = phaseEndDate;
            }
          });
  
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des phases:', err);
        }
      });
    }
  }
checkProjectStatus(project: any) {
  if (!project.phaseIds || project.phaseIds.length === 0) {
    project.status = 'NOT_STARTED';
    return;
  }

  let allPhasesCompleted = true;
  
  // Vérifier chaque phase du projet
  project.phaseIds.forEach((phaseId: string) => {
    this.projectService.getphaseById(phaseId).subscribe({
      next: (phase) => {
        
        this.checkPhaseStatus(phase).then(phaseStatus => {
          phase.status = phaseStatus;
          
          // Si une phase n'est pas complète, le projet ne l'est pas
          if (phaseStatus !== 'COMPLETED') {
            allPhasesCompleted = false;
          }
          
          // Mettre à jour le statut du projet
          project.status = allPhasesCompleted ? 'COMPLETED' : 'IN_PROGRESS';
        });
      },
      error: (err) => {
        console.error(`Erreur phase ${phaseId}:`, err);
        project.status = 'ERROR';
      }
    });
  });
}
async checkPhaseStatus(phase: any): Promise<string> {
  if (!phase.taskIds || phase.taskIds.length === 0) {
    return 'NOT_STARTED';
  }

  try {
    // Récupérer toutes les tâches de la phase
    const tasks = await this.projectService.getTaskByPhase(phase.id).toPromise();
    
    if (!tasks || tasks.length === 0) {
      return 'NOT_STARTED';
    }

    // Vérifier si toutes les tâches sont complétées
    const allTasksCompleted = tasks.every((task: any) => task.status === 'COMPLETED');
    return allTasksCompleted ? 'COMPLETED' : 'IN_PROGRESS';
    
  } catch (error) {
    console.error(`Erreur lors de la récupération des tâches pour la phase ${phase.id}:`, error);
    return 'ERROR';
  }
}
  goToProjectDetails(project: any): void {
    this.router.navigate(['/project', project.id], {
      state: { projectData: project ,
        members:this.members
      }
    });
  }

  addProject(): void {
    const modalRef = this.modalService.open(ProjectFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false // Empêche la fermeture avec la touche Echap si backdrop='static'
    });

    modalRef.result.then(
      (result) => {
        console.log('La modale a été fermée avec succès');
        if (result) {
          console.log('Nouveau projet ajouté:', result);
          this.getProjects(); 
        } else {
          console.log('La modale a été fermée avec succès mais sans résultat.');
        
        }
      },
      (reason) => {
        console.log(`La modale a été annulée/fermée (${reason})`);
      }
    );
  }
  openMembersModal(project: any, event: MouseEvent): void {
    event.stopPropagation(); 

    const modalRef = this.modalService.open(ProjectMembersComponent, {
      size: 'lg', 
      centered: true, 
      backdrop: 'static', // Empêche la fermeture au clic extérieur
      keyboard: false, // Empêche la fermeture avec Echap
      
    
    });

    modalRef.componentInstance.project = project;

    // Utiliser modalRef.result (Promise) au lieu de afterClosed (Observable)
    modalRef.result.then(result => {
      console.log('La modale des membres a été fermée', result);
     
    }, (reason) => { console.log(`La modale des membres a été annulée/fermée (${reason})`); });

  }
 


  
  deleteProject(projectId: string): void {

        this.isLoading = true;
        
        this.projectService.deleteProject(projectId).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open('Projet archivé avec succès', 'Fermer', { 
                    duration: 3000,
                    panelClass: ['success-snackbar'] 
                });
                
                this.getProjects(); // Recharger la liste des projets
                
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Erreur:', err);
                this.snackBar.open('Échec de l\'archivage du projet', 'Fermer', { 
                    duration: 5000,
                    panelClass: ['error-snackbar'] 
                });
            }
        });
 
}
 }

