import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgenceFormComponent } from '../agence-form/agence-form.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AgencyDetailsComponent } from '../agency-details/agency-details.component';
import { Router } from '@angular/router';
import { AgenceService } from '../../services/agenceService';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-agences',
  templateUrl: './agences.component.html',
  styleUrls: ['./agences.component.scss']
  
})
export class AgencesComponent implements OnInit{
  currentDate: string;
  searchQuery: string = '';
  agencies: any[] = [];
  filteredAgencies: any[] = [];
  errorMessage: string | null = null;
  isLoading!:boolean;
  constructor(
    
    private modalService: NgbModal,
    private router: Router,
    private agenceService:AgenceService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) { 
    this.currentDate = new Date().toLocaleDateString();
   
  }

  ngOnInit(): void {
    this.loadAgencies();
    this.authService.getDecodedToken();
  }
  loadAgencies(): void {
    this.isLoading = true;
    this.agenceService.getAllAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.filteredAgencies = [...this.agencies];
        console.log('Agences chargées:', this.agencies);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        // Affichez un message d'erreur à l'utilisateur
        this.isLoading = false;
      }
    });
  }
  filterAgencies(): void {
    if (!this.searchQuery) {
      this.filteredAgencies = [...this.agencies];
      return;
    }
    this.filteredAgencies = this.agencies.filter(agency =>
      agency.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      agency.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      agency.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      agency.phone.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addAgency(): void {
    const modalRef = this.modalService.open(AgenceFormComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.isEditMode = false;

    modalRef.result.then((result) => {
      if (result) {
        this.agencies.unshift(result);
        this.filterAgencies();
        this.toastr.success('Nouvelle agence ajoutée');
      }
    }).catch(() => {});
  }

  editAgency(agency: any): void {
    const modalRef = this.modalService.open(AgenceFormComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.isEditMode = true;
    modalRef.componentInstance.agencyData = agency;

    modalRef.result.then((result) => {
      if (result) {
        const index = this.agencies.findIndex(a => a._id === agency._id);
        if (index !== -1) {
          this.agencies[index] = result;
          this.filterAgencies();
          this.toastr.success('Agence mise à jour');
        }
      }
    }).catch(() => {});
  }
  
  
  deleteAgence(id: string, name: string): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      windowClass: 'confirmation-modal'
  });

  modalRef.componentInstance.message = `Voulez-vous vraiment supprimer l'agence `;
  modalRef.componentInstance.username = name;
  modalRef.result.then((confirm) => {
      if (confirm) {
        const token = this.authService.getAccessToken();
        if(token){
          this.agenceService.deleteAgence(id, token).subscribe({
            next: () => {
              this.showSuccess('Agence supprimée avec succès');
              this.loadAgencies(); // Rafraîchir la liste
            },
            error: (err) => {
              console.error(err);
              this.showError('Échec de la suppression de l\'agence');
            }
          });}
      }
  }).catch(() => {
      console.log('Suppression annulée');
  });
  
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  showAgencyDetails(agency: any) {
    const modalRef = this.modalService.open(AgencyDetailsComponent, { 
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.agency = agency;
  }
}
