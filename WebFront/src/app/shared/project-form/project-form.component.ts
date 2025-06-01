
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/ProjectService';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  standalone: false

})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal, // Inject NgbActiveModal
  
    private projectService: ProjectService,
    private authService: AuthService, // Injectez AuthService
    // @Inject(MAT_DIALOG_DATA) public data: any // Injectez si vous passez des données à la modale
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)] ,
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  get name() { return this.projectForm.get('name'); }
  get description() { return this.projectForm.get('description'); }
  get address() { return this.projectForm.get('address'); }

  saveProject(): void {
    if (this.projectForm.invalid || this.isLoading) {
      this.projectForm.markAllAsTouched(); // Marque tous les champs comme touchés pour afficher les erreurs
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const idCompany = localStorage.getItem("idAgence");
    const idAdmin = localStorage.getItem("user_id"); 
    const CompanyName=localStorage.getItem("AgencyName");
    console.log("iduser",idAdmin)
    if (!idCompany || !idAdmin || !CompanyName) {
      this.errorMessage = "Impossible de récupérer les informations nécessaires (Agence ou Administrateur).";
      this.isLoading = false;
      return;
    }

    const projectData = {
      name: this.name?.value,
      description: this.description?.value,
      address: this.address?.value,
      idCompany: idCompany,
      companyName:CompanyName,
      idAdmin: idAdmin
    };
    console.log("projet ajoutéé",projectData)
    this.projectService.createProject(projectData).subscribe({
      next: (newProject) => {
        this.isLoading = false;
        console.log('Projet créé:', newProject);
        this.activeModal.close(newProject); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Une erreur est survenue lors de la création du projet.';
        console.error('Erreur création projet:', err);
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel click'); // Ferme simplement la modale sans renvoyer de données
  }
}
