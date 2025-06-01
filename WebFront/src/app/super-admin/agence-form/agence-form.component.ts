import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AgenceService } from '../../services/agenceService';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-agence-form',
  templateUrl: './agence-form.component.html',
  styleUrl: './agence-form.component.scss'
})
export class AgenceFormComponent implements OnInit {
  agenceForm: FormGroup;
  @Input() isEditMode = false;
  @Input() agencyData: any;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private agenceService:AgenceService,
    private toastr: ToastrService
   

  ) {
    this.agenceForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }
    

  ngOnInit(): void {
    if (this.isEditMode && this.agencyData) {
      this.agenceForm.patchValue({
        name: this.agencyData.name,
        address: this.agencyData.address,
        email: this.agencyData.email,
        phone: this.agencyData.phone
      });
    }
  
  }
  


  onSubmit(): void {
    if (this.agenceForm.invalid) {
      this.markFormGroupTouched(this.agenceForm);
      return;
    }

    this.isLoading = true;
    const agenceData = {
      ...this.agenceForm.value,
      id: this.agencyData?.id // On conserve l'ID existant en mode édition
    };

    if (this.isEditMode) {
      this.updateAgency(agenceData);
    } else {
      this.createAgency(agenceData);
    }
  }

  private createAgency(agenceData: any): void {
    this.agenceService.createAgence(agenceData).subscribe({
      next: (response) => {
        this.toastr.success('Agence créée avec succès');
        this.activeModal.close(response);
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création');
        console.error(err);
      },
      complete: () => this.isLoading = false
    });
  }

  private updateAgency(agenceData: any): void {
    this.agenceService.updateAgence(this.agencyData.id, agenceData).subscribe({
      next: (response) => {
        this.toastr.success('Agence mise à jour avec succès');
        this.activeModal.close(response);
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la mise à jour: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


close(): void {
  this.activeModal.dismiss();
}


}
