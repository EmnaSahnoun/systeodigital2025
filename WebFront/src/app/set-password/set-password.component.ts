import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommercialService } from '../services/commercial.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss'
})
export class SetPasswordComponent {
@Input() clientId!: string; // L'ID du client pour lequel définir le mot de passe
  @Input() clientName!: string; // Le nom du client pour l'affichage

  passwordForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private commercialService: CommercialService
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]] // Exemple: mot de passe d'au moins 8 caractères
    });
  }

  ngOnInit(): void {
    if (!this.clientId) {
      this.errorMessage = "ID du client non fourni.";
      // Optionnellement, fermer le modal ou désactiver le formulaire
    }
  }

  get password() { return this.passwordForm.get('password'); }

  setPassword(): void {
    if (this.passwordForm.invalid || this.isLoading) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const newPasswordValue = this.password?.value;

    // La structure du payload peut varier selon l'API Keycloak
    const passwordDetails = {
      type: 'password',
      temporary: false, // Mettre à true si le mot de passe doit être changé à la prochaine connexion
      value: newPasswordValue
    };

    this.commercialService.setKeycloakPassword(this.clientId, passwordDetails).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = `Le mot de passe pour ${this.clientName} a été défini avec succès.`;
        // Fermer le modal après un court délai pour afficher le message de succès
        setTimeout(() => {
          this.activeModal.close('success');
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.errorMessage || err.message || 'Une erreur est survenue lors de la définition du mot de passe.';
        console.error('Erreur définition mot de passe:', err);
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel click');
  }
}
