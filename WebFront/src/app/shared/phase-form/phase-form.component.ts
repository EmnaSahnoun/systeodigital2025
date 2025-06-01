import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../services/ProjectService'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-phase-form',
  templateUrl: './phase-form.component.html',
  styleUrl: './phase-form.component.scss',
  standalone: false
})
export class PhaseFormComponent  implements OnInit {
  // Reçoit l'ID du projet parent depuis le composant qui ouvre la modale
  @Input() projectId!: string;

  phaseForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private projectService: ProjectService
  ) {
    this.phaseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)], // Optionnel, max 500 caractères
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
      // projectId n'est pas dans le formulaire, il est passé en @Input
    });
  }

  ngOnInit(): void {
    if (!this.projectId) {
      console.error("Erreur: Project ID manquant pour créer une phase.");
      this.errorMessage = "L'identifiant du projet est manquant. Impossible de créer la phase.";
      // Optionnellement, désactiver le formulaire ou fermer la modale
      this.phaseForm.disable();
    }
  }

  // Getters pour un accès facile dans le template HTML
  get name() { return this.phaseForm.get('name'); }
  get description() { return this.phaseForm.get('description'); }
  get startDate() { return this.phaseForm.get('startDate'); }
  get endDate() { return this.phaseForm.get('endDate'); }

  savePhase(): void {
    if (this.phaseForm.invalid || this.isLoading || !this.projectId) {
      this.phaseForm.markAllAsTouched(); // Affiche les erreurs si le formulaire est invalide
      if (!this.projectId) {
        this.errorMessage = "L'identifiant du projet est manquant.";
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const phaseData = {
      name: this.name?.value,
      description: this.description?.value,
      startDate: this.startDate?.value,
      endDate: this.endDate?.value,
      projectId: this.projectId // Utilise l'ID reçu en Input
    };

    console.log("Données de la phase à créer :", phaseData);

    this.projectService.createPhase(phaseData).subscribe({
      next: (newPhase) => {
        this.isLoading = false;
        console.log('Phase créée:', newPhase);
        this.activeModal.close(newPhase); // Ferme la modale et renvoie la nouvelle phase
      },
      error: (err) => {
        this.isLoading = false;
        // Utilise le message d'erreur du service s'il existe
        this.errorMessage = err.message || 'Une erreur est survenue lors de la création de la phase.';
        console.error('Erreur création phase:', err);
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel click'); // Ferme la modale sans renvoyer de données
  }

}

