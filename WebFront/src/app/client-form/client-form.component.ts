import { Client } from '../clients/clients.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommercialService } from '../services/commercial.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private commercialService: CommercialService, // Décommentez pour injecter votre service client
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], 
      address: ['', Validators.required],

    });
  }

  ngOnInit(): void {}

  // Getters pour un accès facile aux contrôles de formulaire dans le template
  get name() { return this.clientForm.get('name'); }
  get email() { return this.clientForm.get('email'); }
  get phone() { return this.clientForm.get('phone'); }
  get companyName() { return this.clientForm.get('companyName'); }
  get address() { return this.clientForm.get('address'); }
  get idCompany() { return this.clientForm.get('idCompany'); }

  saveClient(): void {
    if (this.clientForm.invalid || this.isLoading) {
      this.clientForm.markAllAsTouched(); // Marque tous les champs comme touchés pour afficher les erreurs
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const idCompany = localStorage.getItem("idAgence");
    
    const CompanyName=localStorage.getItem("AgencyName");
    
    if (!idCompany || !CompanyName) {
      this.errorMessage = "Impossible de récupérer les informations nécessaires (Agence).";
      this.isLoading = false;
      return;
    }
    const clientData = {
      
      name: this.name?.value,
      address: this.address?.value,
      email: this.email?.value,
      phone:this.phone?.value,
      
      idCompany: idCompany,
      companyName:CompanyName      
    };
    console.log("cleint data",clientData)
    this.commercialService.createClient(clientData).subscribe({
      next: (newClient) => {
        this.isLoading = false;
        console.log('Client créé:', newClient);
        this.activeModal.close(newClient); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Une erreur est survenue lors de la création du client.';
        console.error('Erreur création client:', err);
      }
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel click');
  }

}
