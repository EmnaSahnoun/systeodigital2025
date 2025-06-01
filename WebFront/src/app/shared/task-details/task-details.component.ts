import { Component, Inject, Input, OnInit } from '@angular/core';
import { Task } from '../../models/task.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Importé pour contrôler le modal Ngb
import { ProjectService } from '../../services/ProjectService';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ActivityService } from '../../services/activityService';
import { AgenceService } from '../../services/agenceService';
import { CommentResponse, TaskHistory } from '../../models/activity.interfaces';
import { ConfirmationDialogComponent } from '../../super-admin/confirmation-dialog/confirmation-dialog.component';
import { DocumentService } from '../../services/document.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { MediaFileResponse } from '../../models/mediaFile';
import { Location } from '@angular/common';
@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss',
  standalone: false
})
export class TaskDetailsComponent implements OnInit {
  @Input() task: any;
  subtasks: any[] = [];
  isLoadingSubtasks = false;
  newCommentText: string = '';
  isLoadingComments = false;
  isLoadingActivities = false;

  // Document/File related properties
  isLoadingDocuments = false;
  selectedFile: File | null = null;
   uploadProgress: number | null = null;
  isUploading = false;
  fileDescription: string = '';
// Pour l'édition des commentaires
  editingCommentId: string | null = null;
  editedCommentContent: string = '';
// Pour l'édition des sous-tâches
  editingSubtaskId: string | null = null;
  editedSubtaskData: any = {};
  // Options pour les select des sous-tâches
  taskStatusOptions = ['TODO', 'IN_PROGRESS', 'COMPLETED']; // Adaptez selon vos statuts
  taskPriorityOptions = ['LOW', 'MEDIUM', 'HIGH']; // Adaptez selon vos priorités
  isAddingDocument = false; // Pour contrôler la visibilité du formulaire d'upload

isAddingSubtask = false;
  newSubtaskData: any = {};
 private originalPathForModal!: string;
name:string="";
  constructor(
    public activeModal: NgbActiveModal,
    public agenceService: AgenceService,
    private activityService:ActivityService,
    private projectService: ProjectService,
    private modalService: NgbModal,
    private documentService:DocumentService,
    private location: Location

  ) {
    
  }

  ngOnInit(): void {
     this.originalPathForModal = this.location.path();

    console.log('Task details:', this.task);
    // Initialiser les tableaux pour éviter les erreurs dans le template
    if (!this.task.documents) { // Changed from attachments to documents
      this.task.documents = [];
    }
    if (!this.task.activities) {
      this.task.activities = [];
    }
    if (!this.subtasks) { // Initialiser subtasks si ce n'est pas déjà fait
      this.subtasks = [];
    }

    if (this.task?.id) {
      this.loadDocuments();
      this.loadComments();
      this.loadActivities(); // Charger l'historique (activités)
    }
    if (this.task?.subTaskIds?.length > 0 && this.task.id) { // Assurez-vous que task.id existe aussi

      this.getSubtasks(this.task.subTaskIds);
    }
   
    if (this.task?.id) {
      const newPath = `${this.originalPathForModal}/${this.task.id}`;
      // Use replaceState to change the URL without adding to browser history,
      // and to avoid issues if the path already ends with the task ID.
      if (this.location.path() !== newPath && !this.location.path().endsWith(`/${this.task.id}`)) {
        this.location.replaceState(newPath);
      }
    }
    }

  private arrayToDate(createdAtValue: any): Date | null {
    if (createdAtValue instanceof Date) {
      return createdAtValue; // Already a Date object
    }
    // Attempt to parse if it's a string or number (e.g., ISO string or timestamp)
    if (typeof createdAtValue === 'string' || typeof createdAtValue === 'number') {
      const d = new Date(createdAtValue);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }

    if (!Array.isArray(createdAtValue) || createdAtValue.length < 6) {
      console.warn('createdAt is not a valid array or already processed:', createdAtValue);
      return null; 
    }

    // Assuming array is [year, month, day, hour, minute, second, nanoseconds (optional)]
    const year = createdAtValue[0];
    const month = createdAtValue[1] - 1; // JS Date month is 0-indexed (0 for Jan, 1 for Feb, etc.)
    const day = createdAtValue[2];
    const hour = createdAtValue[3];
    const minute = createdAtValue[4];
    const second = createdAtValue[5];
    const milliseconds = createdAtValue.length > 6 && typeof createdAtValue[6] === 'number' 
                       ? Math.floor(createdAtValue[6] / 1000000) 
                       : 0;

    const newDate = new Date(year, month, day, hour, minute, second, milliseconds);

    if (isNaN(newDate.getTime())) {
      console.error('Failed to convert array to Date:', createdAtValue);
      return null;
    }
    return newDate;
  }
loadComments(): void {
    this.isLoadingComments = true;
    this.activityService.getCommentsByTaskId(this.task.id).subscribe({
      next: (comments) => {
        this.task.comments = comments.map(comment => ({
          ...comment,
             createdAt: this.arrayToDate(comment.createdAt) ?? new Date() // Fallback if null
    
        }));
        this.isLoadingComments = false;
        console.log('Comments loaded:', this.task.comments);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.task.comments = []; // Assurer que c'est un tableau en cas d'erreur
        this.isLoadingComments = false;
      }
    });
  }
  

  // Sample data structure for reference
  getSampleTask() {
    this.task= {
      id: '1',
      name: 'Innovate Ltd. Corporate Website Design',
      description: 'The goal of this project is to design a comprehensive and modern UI kit for Innovate Ltd\'s corporate website...',
      priority: 'HIGH', // Assuming 'HIGH' is a valid TaskPriority
      startDate: new Date('2028-06-01'),
      endDate: new Date('2028-09-30'),
      progress: 85,
      subtasks: [
        { name: 'Develop Initial Wireframes', assignee: 'Eric Green' },
        { name: 'Homepage UI', assignee: 'Brian Adams' },
        { name: 'Design Inner Pages UI', assignee: 'Brian Adams' },
        { name: 'Client Feedback Integration', assignee: 'Eric Green' }
      ],
         
      documents: [ // Changed from attachments to documents
        { id: 'doc1', filename: 'Innovate.Ltd_Homepage_UI.fig', description: 'Final homepage UI in Figma', mediaType: 'DOCUMENT', size: 1024, uploadDate: new Date(), uploadedBy: 'user1', uploaderUsername: 'Eric G.' },
        { id: 'doc2', filename: 'Innovate.Ltd_InnerPages.pdf', description: 'Approved layouts for inner pages', mediaType: 'DOCUMENT', size: 2048, uploadDate: new Date(), uploadedBy: 'user2', uploaderUsername: 'Brian A.' },
        { id: 'doc3', filename: 'Project_Overview.mp4', description: 'Project overview video', mediaType: 'VIDEO', size: 10240, uploadDate: new Date(), uploadedBy: 'user1', uploaderUsername: 'Eric G.' },
        { id: 'doc4', filename: 'Logo_Concept.png', description: 'Logo concept art', mediaType: 'IMAGE', size: 512, uploadDate: new Date(), uploadedBy: 'user2', uploaderUsername: 'Brian A.' }

   ],
      requirements: [
        'Brand Consistency: Ensure the UI elements align with Innovate Ltd\'s branding',
        'Responsive Design: The UI kit must be designed for optimal performance on all devices',
        'User Experience: Focus on creating an intuitive and engaging user experience',
        'Design Variations: Provide multiple design variations for key pages'
      ],
      guidelines: [
        'Adhere to the wireframes and initial design concepts approved by the client',
        'Implement feedback from the client and stakeholders in a timely manner',
        'Ensure all design elements are scalable and adaptable to future updates'
      ],
      activities: [
        { user: 'Eric Green', timestamp: new Date(), content: 'Initial wireframes are completed and ready for review.', hasReply: true },
        { user: 'Brian Adams', timestamp: new Date(), content: 'Homepage UI design has been finalized and uploaded. Awaiting feedback.', hasReply: false },
        { user: 'Eric Green', timestamp: new Date(), content: 'Client feedback has been integrated. Please review the changes.', hasReply: true }
      ],
      comments: [
        { user: 'Alice Wonderland', timestamp: new Date(Date.now() - 86400000), content: 'Great progress on the homepage UI!' },
        { user: 'Bob The Builder', timestamp: new Date(), content: 'Can we get an update on the inner pages?' }
      ] // Added sample comments
    };
  }
loadDocuments(): void {
    if (!this.task?.id) return;
    this.isLoadingDocuments = true;
    // Assuming projectService has a method to get documents by task ID
    // And it needs to resolve uploader usernames similar to loadActivities
    this.documentService.getFilesByTask(this.task.id as string).pipe(
      switchMap((documents: MediaFileResponse[]) => {
        if (!documents || documents.length === 0) {
          return of([]);
        }
        const userRequests: Observable<MediaFileResponse>[] = documents.map(doc => {
        
          if (doc.uploadedBy) {
            return this.agenceService.getUserById(doc.uploadedBy).pipe(
              map(user => ({ ...doc, uploaderUsername: user.username })),
              catchError(() => of({ ...doc, uploaderUsername: 'N/A' }))
            );
          }
          return of({ ...doc, uploaderUsername: 'System' });
        });
        return forkJoin(userRequests);
      })
    ).subscribe({
      next: (processedDocuments) => {
         this.task.documents = processedDocuments as MediaFileResponse[];
               this.isLoadingDocuments = false;
        console.log('Documents loaded:', this.task.documents);
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.task.documents = [];
        this.isLoadingDocuments = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
    } else {
      this.selectedFile = null;
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.task?.id) {
      alert('Please select a file and ensure task context is available.');
      return;
    }
    const currentUserId = localStorage.getItem("user_id");
    if (!currentUserId) {
      console.error('User not authenticated for file upload');
      alert('You must be logged in to upload files.');
      return;
    }
this.isUploading = true;
    this.uploadProgress = 0;

    this.documentService.uploadFile(
      this.selectedFile,
      this.fileDescription ,
      this.task.id as string,
      this.task.projectId || null, // Ensure projectId is passed or null
      this.task.phaseId || null,   // Ensure phaseId is passed or null
      currentUserId
    ).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
            }
          } else if (event instanceof HttpResponse) {
            // Assuming the backend returns the MediaFile object in the body of the response
            const newDocument = event.body as MediaFileResponse;
            const currentUsername = localStorage.getItem("username") || 'You';
            
            if (!this.task.documents) {
              this.task.documents = [];
            }
            this.task.documents.unshift({ ...newDocument, uploaderUsername: currentUsername });
            
            this.selectedFile = null;
            this.fileDescription = '';
            this.uploadProgress = null;
            this.isUploading = false;
            const fileInput = document.getElementById('fileUploadInput') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = ''; // Reset file input
            }
             this.isAddingDocument = false; // Cacher le formulaire après succès
          
            this.loadActivities(); // Reload activities if uploads are logged
            alert('File uploaded successfully!');
          }
        },
        error: (err) => {
            console.error('Error uploading document:', err);
            alert(`Failed to upload file: ${err.message || 'Unknown error'}`);
            this.isUploading = false;
            this.uploadProgress = null;
        }
    });
  }
 toggleAddDocumentForm(): void {
    this.isAddingDocument = !this.isAddingDocument;
    if (this.isAddingDocument) {
      // Réinitialiser les champs lorsque le formulaire est affiché
      this.selectedFile = null;
      this.fileDescription = '';
      this.uploadProgress = null;
      this.isUploading = false; // S'assurer que l'état de chargement est réinitialisé
      // Réinitialiser l'input de fichier
      const fileInput = document.getElementById('fileUploadInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

 downloadDocument(doc: MediaFileResponse): void {
  
    this.documentService.downloadFile(doc.id).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = doc.filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    }, error => {
      console.error('Error downloading file:', error);
      alert('Failed to download file.');
    });
  }

  deleteDocument(docId: string): void {
    // Confirmation dialog can be added here similar to deleteComment
    this.documentService.deleteFile(docId).subscribe({
      next: () => {
        this.task.documents = this.task.documents.filter((d: MediaFileResponse) => d.id !== docId);
       
        this.loadActivities(); // Reload activities if deletions are logged
        alert('Document deleted successfully.');
      },
      error: (err) => {
        console.error('Error deleting document:', err);
        alert('Failed to delete document.');
      }
    });
  }

  getSubtasks(subTaskIds: string[]): void {
    this.isLoadingSubtasks = true;
    
    // Créer un tableau de requêtes pour toutes les sous-tâches
    const requests = subTaskIds.map(id => 
      this.projectService.getTaskByid(id)
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin(requests).subscribe({
      next: (results) => {
        this.subtasks = results.flat(); // Fusionner les résultats
        this.isLoadingSubtasks = false;
        console.log('Subtasks loaded:', this.subtasks);
      },
      error: (err) => {
        console.error('Error loading subtasks:', err);
        this.isLoadingSubtasks = false;
      }
    });
  }
 addComment(): void {
    const currentUserId = localStorage.getItem("user_id");
    const currentUsername = localStorage.getItem("username");
    console.log("currentusername",currentUsername)
    if (this.newCommentText.trim() && this.task?.id) {
        if (!currentUserId || !currentUsername) {
            console.error('User not authenticated');
            return;
        }

        const commentData = {
            taskId: this.task.id,
            idUser: currentUserId,
            username: currentUsername,
            content: this.newCommentText.trim()
        };
        console.log('Adding comment:', commentData);

        this.activityService.addComment(commentData).subscribe({
          next: (backendResponse: CommentResponse) => {
                if (!this.task.comments) {
                    this.task.comments = [];
                }
                const transformedCreatedAt = this.arrayToDate(backendResponse.createdAt);

               const newCommentForUI: CommentResponse = {
                    ...backendResponse, // Contient généralement id, createdAt générés par le backend
                     taskId: backendResponse.taskId || this.task.id,
                    idUser: backendResponse.idUser || currentUserId,
                    username: backendResponse.username || currentUsername,
                    content: backendResponse.content || this.newCommentText.trim(),
                      createdAt: transformedCreatedAt ?? new Date() // Fallback if null
         
       
                };

                this.task.comments.unshift(newCommentForUI);
                this.newCommentText = '';
                this.loadActivities(); // Recharger les activités pour refléter le nouveau commentaire si nécessaire
               
            },
            error: (err) => {
                console.error('Error adding comment:', err);
            }
        });
    }
}

loadActivities(): void {
  this.isLoadingActivities = true;
  
  this.activityService.getHistoryByTaskId(this.task.id).pipe(
    switchMap((activities: TaskHistory[]) => {
      if (!activities || activities.length === 0) {
        return of([]); // Return empty array if no activities
      }
       console.log('Raw activities from backend:', JSON.parse(JSON.stringify(activities)));
     
      const userRequests: Observable<TaskHistory>[] = activities.map(activity => {
 console.log('Processing activity for user fetch:', JSON.parse(JSON.stringify(activity)));
      
        if (activity.idUser) { // Check if idUser exists
          return this.agenceService.getUserById(activity.idUser).pipe(
            map(user => {
               console.log(`User fetched for idUser ${activity.idUser} (Activity ID: ${activity.id}):`, JSON.parse(JSON.stringify(user)));
              return { ...activity, username: user.username }; // Assign username to activity object
            }),
            catchError(err => {
               console.error(`Error fetching user ${activity.idUser} for activity (ID: ${activity.id}). Original activity.username: '${activity.username}'. Error:`, err);
              // If fetching user details fails, use the username already present in the activity if it exists and is not an empty string,
              // otherwise fallback to 'User N/A'.
              const fallbackUsername = (activity.username && activity.username.trim() !== '') ? activity.username : 'User N/A';
              return of({ ...activity, username: fallbackUsername });
              
            })
          );
        } else {
          return of({ ...activity, username: activity.username || 'System Action' });
        }
      });
      return forkJoin(userRequests); // Execute all user fetch requests
    })
  ).subscribe({
    next: (processedActivitiesWithUsernames) => {
      this.task.activities = processedActivitiesWithUsernames; // Assigner directement les activités brutes
      this.isLoadingActivities = false;
      console.log('Activities (history) loaded with usernames:', this.task.activities);
    
    },
    error: (err) => {
      console.error('Error loading activities or fetching usernames:', err);
      this.task.activities = []; // Ensure it's an array in case of error
      this.isLoadingActivities = false;
    }
  });
}

generateActivityDescription(activity: TaskHistory): string {
  
  switch(activity.action) {
    case 'CREATE':
      if(activity.historyType==='commentaire'){
        return `a ajouté un commentaire.`;
      }
      else if(activity.historyType==='tache'){
        return `a ajouté une sous-tâche.`;
      }
      else{
        return `a ajouté un document`;
      }
    case 'DELETE':
      if(activity.historyType==='commentaire'){
        return `a supprimé un commentaire.`;
      }
      else if(activity.historyType==='tache'){
        return `a supprimé une sous-tâche.`;
      }
      else{
        return `a supprimé un document`;
      }
    case 'UPDATE':
      if(activity.historyType==='commentaire'){
        return `a modifié un commentaire.`;
      }      
      if (activity.fieldChanged && activity.oldValue && activity.newValue) {
        return `a mis à jour le champ "${activity.fieldChanged}" de "${activity.oldValue}" à "${activity.newValue}".`;
    
      }
     if (activity.fieldChanged) {
         return `a mis à jour le champ "${activity.fieldChanged}".`;
      }
      else{return `a effectué une mise à jour.`;}
      case 'COMMENT':
      if(activity.historyType==='commentaire'){
        return `a ajouté un commentaire.`;
      }
      return `a effectué une mise à jour.`;
      
    default:
       return `a effectué l'action : ${activity.action}.`;
  }
}
 // --- Méthodes pour les actions sur les commentaires ---
  isCurrentUserComment(comment: CommentResponse): boolean {
    const currentUserId = localStorage.getItem("user_id");
    return comment.idUser === currentUserId;
  }

  startEditComment(comment: CommentResponse): void {
    this.editingCommentId = comment.id;
    this.editedCommentContent = comment.content;
  }

  saveEditComment(comment: CommentResponse): void {
    if (!this.editingCommentId || this.editedCommentContent.trim() === '') {
      this.cancelEditComment();
      return;
    }
    const updatedContent = this.editedCommentContent.trim();
  
    const currentUserId = localStorage.getItem("user_id");
    const currentUsername = localStorage.getItem("username");

    if (!this.task?.id || !currentUserId || !currentUsername) {
      console.error('Missing required information for updating comment (taskId, userId, username)');
      alert('Could not update comment. User or task information is missing.');
      this.cancelEditComment();
      return;
    }

    const commentUpdatePayload = {
      taskId: this.task.id,
      idUser: currentUserId,
      username: currentUsername,
      content: updatedContent
    };
    this.activityService.updateComment(this.editingCommentId, commentUpdatePayload).subscribe({
         next: (updatedCommentFromBackend) => {
  
        // Mettre à jour le commentaire dans la liste this.task.comments
        const index = this.task.comments.findIndex((c: CommentResponse) => c.id === this.editingCommentId);
        if (index > -1) {
          const transformedCreatedAt = this.arrayToDate(updatedCommentFromBackend.createdAt);
          this.task.comments[index] = {
             ...this.task.comments[index], // Conserver l'état existant côté client
             ...updatedCommentFromBackend, // Étaler les propriétés de la réponse backend
             content: updatedContent, // S'assurer que le contenu local est utilisé
             createdAt: transformedCreatedAt ?? new Date() // Fallback to current date if transformation fails
       
            };   }
        this.cancelEditComment();
        this.loadActivities(); // Recharger l'historique si la modification de commentaire y est tracée
      },
      error: (err) => {
        console.error('Error updating comment:', err);
        // Rollback optimistic update si implémenté
        // comment.content = originalContent;
        alert('Failed to update comment.');
        this.cancelEditComment();
      }
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editedCommentContent = '';
  }

  deleteComment(commentId: string): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
                centered: true,
                windowClass: 'confirmation-modal'
            });
        
            modalRef.componentInstance.message = `Voulez-vous vraiment supprimer ce Commentaire `;
            
        
            modalRef.result.then((confirm) => {
                if (confirm) {
                  const currentUserId = localStorage.getItem("user_id");
      const currentUsername = localStorage.getItem("username");
      if (!this.task?.id || !currentUserId||!currentUsername) {
    console.error('Missing required information');
    return;
  }
      this.activityService.deleteComment(commentId, this.task.id, currentUserId).subscribe({
        next: () => {
          this.task.comments = this.task.comments.filter((c: CommentResponse) => c.id !== commentId);
          this.loadActivities(); // Recharger l'historique
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          alert('Failed to delete comment.');
        }
      });
                    
                    
                }
            }).catch(() => {
                console.log('Suppression annulée');
            });  
   
  }

  // --- Méthodes pour la modification des sous-tâches ---
  startEditSubtask(subtask: any): void {
    this.editingSubtaskId = subtask.id;
    this.editedSubtaskData = {
      ...subtask,
      // Assurez-vous que les dates sont au format YYYY-MM-DD pour les inputs de type "date"
      startDate: this.formatDateForInput(subtask.startDate),
      endDate: this.formatDateForInput(subtask.endDate)
    };
    console.log('Editing subtask:', this.editedSubtaskData);
  }

  saveSubtaskEdit(): void {
    if (!this.editingSubtaskId) return;

    // Préparer le payload avec les données formatées pour l'API
    const updatePayload = {
      ...this.editedSubtaskData,
      startDate: this.formatDateForApi(this.editedSubtaskData.startDate),
      endDate: this.formatDateForApi(this.editedSubtaskData.endDate)
    };
    // Supprimer l'id du payload si l'API ne l'attend pas dans le corps de la requête PUT/PATCH
    delete updatePayload.id; 
    // Conserver d'autres champs non modifiables si nécessaire ou les exclure
    // delete updatePayload.subTaskIds; // Exemple si ce champ ne doit pas être envoyé

    this.projectService.updateTask(this.editingSubtaskId, updatePayload).subscribe({
      next: (updatedTask) => {
        const index = this.subtasks.findIndex(st => st.id === this.editingSubtaskId);
        if (index > -1) {
          // Mettre à jour la sous-tâche dans la liste locale avec les données retournées par l'API
          // et s'assurer que les dates sont correctement formatées pour l'affichage si nécessaire
          this.subtasks[index] = { ...this.subtasks[index], ...updatedTask };
        }
        console.log(`Subtask ${this.editingSubtaskId} updated successfully.`, updatedTask);
        this.loadActivities(); // Recharger l'historique si les modifications de sous-tâches y sont tracées
        this.cancelSubtaskEdit();

      },
      error: (err) => {
        console.error(`Error updating subtask ${this.editingSubtaskId}:`, err);
        // Optionnel: Afficher un message d'erreur à l'utilisateur
        alert('Failed to update subtask.');
        // Peut-être ne pas annuler l'édition pour permettre à l'utilisateur de réessayer
      }
    });
  }

  cancelSubtaskEdit(): void {
    this.editingSubtaskId = null;
    this.editedSubtaskData = {};
  }
deleteSubtask(subtaskId: string, subtaskName: string): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      windowClass: 'confirmation-modal'
    });

    modalRef.componentInstance.message = `Voulez-vous vraiment supprimer la sous-tâche "${subtaskName}"`;

    modalRef.result.then((confirm) => {
      if (confirm) {
        // Assurez-vous que votre projectService a une méthode pour supprimer une tâche/sous-tâche
        // et qu'elle gère la mise à jour de l'historique si nécessaire.
        this.projectService.deleteTask(subtaskId).subscribe({ // Ou une méthode deleteSubtask dédiée
          next: () => {
            this.subtasks = this.subtasks.filter(st => st.id !== subtaskId);
            console.log(`Subtask ${subtaskId} deleted successfully.`);
            this.loadActivities(); // Recharger l'historique
            // Optionnel: Afficher une notification de succès
            // this.snackBar.open('Sous-tâche supprimée avec succès!', 'Fermer', { duration: 3000 });
          },
          error: (err) => {
            console.error(`Error deleting subtask ${subtaskId}:`, err);
            alert('Failed to delete subtask.');
          }
        });
      }
    }).catch(() => {
      console.log('Subtask deletion cancelled');
    });
  }

toggleAddSubtaskForm(): void {
    this.isAddingSubtask = !this.isAddingSubtask;
    if (this.isAddingSubtask) {
      // S'assurer que l'ID de la phase de la tâche parente est disponible
      if (!this.task.phaseId) {
        console.error("L'ID de la phase de la tâche parente est manquant. Impossible d'initialiser le formulaire d'ajout de sous-tâche.");
        alert("Erreur : L'ID de la phase parente est manquant.");
        this.isAddingSubtask = false; // Empêcher l'ouverture du formulaire
        return;
      }
      this.newSubtaskData = {
        name: '',
        description: '', // Optionnel, mais votre backend pourrait le gérer
        startDate: this.formatDateForInput(new Date()), // Date d'aujourd'hui par défaut
        endDate: '',
        status: 'TODO', // Valeur par défaut
        priority: 'MEDIUM', // Valeur par défaut
        phaseId: this.task.phaseId // Crucial pour le backend
      };
      this.cancelSubtaskEdit(); // Annuler toute édition en cours
    } else {
      this.newSubtaskData = {}; // Réinitialiser si on ferme
    }
  }

  saveNewSubtask(): void {
    if (!this.newSubtaskData.name || !this.newSubtaskData.startDate || !this.newSubtaskData.endDate) {
      alert('Veuillez remplir le nom, la date de début et la date de fin pour la nouvelle sous-tâche.');
      return;
    }

    const payload = {
      ...this.newSubtaskData,
      startDate: this.formatDateForApi(this.newSubtaskData.startDate),
      endDate: this.formatDateForApi(this.newSubtaskData.endDate),
    };

    this.projectService.addSubTask(this.task.id, payload).subscribe({
      next: (createdSubtask) => {
        this.subtasks = [createdSubtask, ...this.subtasks];

        this.newSubtaskData = {}; // Réinitialiser le formulaire
        this.isAddingSubtask = false;
        
        this.loadActivities(); // Recharger l'historique
      },
      error: (err) => {
        console.error('Error creating subtask:', err);
        alert(`Failed to create subtask: ${err.message || 'Unknown error'}`);
      }
    });
  }

  cancelAddSubtask(): void {
    this.isAddingSubtask = false;
    this.newSubtaskData = {};
  }

  private formatDateForInput(dateSource: string | Date | null): string {
    if (!dateSource) return '';
    try {
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date for input:", dateSource, e);
      return '';
    }
  }


  private formatDateForApi(dateString: string): string | null {
    if (!dateString) return null; // Ou retourner une date par défaut / gérer l'erreur
    return new Date(dateString).toISOString(); // Ou le format attendu par votre API
  }

  closeModal(): void {
    if (this.originalPathForModal && this.location.path() !== this.originalPathForModal) {
      this.location.replaceState(this.originalPathForModal);
    }
    this.activeModal.close();
  }

  
}
