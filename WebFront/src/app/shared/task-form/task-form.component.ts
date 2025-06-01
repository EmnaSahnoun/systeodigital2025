import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../services/ProjectService';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  standalone: false
})
export class TaskFormComponent   implements OnInit {
    // Reçoit l'ID de la phase parente depuis le composant qui ouvre la modale
    @Input() phaseId!: string;
    @Input() taskToEdit?: any;
    taskForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
  
    // Options pour les listes déroulantes
    statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    priorities = ['LOW', 'MEDIUM', 'HIGH'];
  
    isEditMode = false; 
    constructor(
      private fb: FormBuilder,
      public activeModal: NgbActiveModal,
      private projectService: ProjectService
    ) {
      this.taskForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', Validators.maxLength(1000)], // Optionnel, max 1000 caractères
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        status: ['TODO', Validators.required], // Valeur par défaut
        priority: ['MEDIUM', Validators.required] // Valeur par défaut
        // phaseId n'est pas dans le formulaire, il est passé en @Input
      });
    }
  
    ngOnInit(): void {
      this.isEditMode = !!this.taskToEdit; 
      if (!this.phaseId) {
        console.error("Erreur: Phase ID manquant pour créer une tâche.");
        this.errorMessage = "L'identifiant de la phase est manquant. Impossible de créer la tâche.";
        this.taskForm.disable();
        return;      
      }
      if (this.isEditMode && this.taskToEdit) {
        // Pré-remplir le formulaire avec les données de la tâche à éditer
        this.taskForm.patchValue({
          name: this.taskToEdit.name,
          description: this.taskToEdit.description,
          // Assurez-vous que les dates sont au format YYYY-MM-DD pour l'input type="date"
          startDate: this.formatDateForInput(this.taskToEdit.startDate),
          endDate: this.formatDateForInput(this.taskToEdit.endDate),
          status: this.taskToEdit.status,
          priority: this.taskToEdit.priority
        });
      }
    }
    private formatDateForInput(dateString: string | Date): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    }
    // Getters pour un accès facile dans le template HTML
    get name() { return this.taskForm.get('name'); }
    get description() { return this.taskForm.get('description'); }
    get startDate() { return this.taskForm.get('startDate'); }
    get endDate() { return this.taskForm.get('endDate'); }
    get status() { return this.taskForm.get('status'); }
    get priority() { return this.taskForm.get('priority'); }
  
    saveTask(): void {
      if (this.taskForm.invalid || this.isLoading || (!this.phaseId && !this.isEditMode)) { // phaseId requis seulement en création
     
        this.taskForm.markAllAsTouched(); // Affiche les erreurs si le formulaire est invalide
        if (!this.phaseId) {
          this.errorMessage = "L'identifiant de la phase est manquant.";
        }
        return;
      }
  
      this.isLoading = true;
      this.errorMessage = null;
  
      const taskData = {
        name: this.name?.value,
        description: this.description?.value || '', // Assurer une chaîne vide si null
        startDate: this.startDate?.value,
        endDate: this.endDate?.value,
        status: this.status?.value,
        priority: this.priority?.value,
        phaseId: this.phaseId // Utilise l'ID reçu en Input
      };
  
      console.log("Données de la tâche à créer :", taskData);
      if (this.isEditMode && this.taskToEdit?.id) {
        // --- Mode Édition ---
        console.log("Données de la tâche à mettre à jour :", taskData);
        this.projectService.updateTask(this.taskToEdit.id, taskData).subscribe({
          next: (updatedTask) => {
            this.isLoading = false;
            console.log('Tâche mise à jour:', updatedTask);
            this.activeModal.close(updatedTask); // Ferme et renvoie la tâche mise à jour
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.message || 'Une erreur est survenue lors de la mise à jour de la tâche.';
            console.error('Erreur mise à jour tâche:', err);
          }
        });
  
      } else {
        // --- Mode Création ---
        if (!this.phaseId) { // Double vérification
           this.errorMessage = "L'identifiant de la phase est requis pour créer une tâche.";
           this.isLoading = false;
           return;
        }
        console.log("Données de la tâche à créer :", taskData);
        this.projectService.createTask(taskData).subscribe({
          next: (newTask) => {
            this.isLoading = false;
            console.log('Tâche créée:', newTask);
            this.activeModal.close(newTask); // Ferme la modale et renvoie la nouvelle tâche
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.message || 'Une erreur est survenue lors de la création de la tâche.';
            console.error('Erreur création tâche:', err);
          }
        });
      }
    }
  
    cancel(): void {
      this.activeModal.dismiss('cancel click'); // Ferme la modale sans renvoyer de données
    }
}
