import { Component, OnInit } from '@angular/core';import { ActivatedRoute, Router } from '@angular/router';
import { CommercialService } from '../services/commercial.service';
import { ConfirmationDialogComponent } from '../super-admin/confirmation-dialog/confirmation-dialog.component'; // Assurez-vous que ce chemin est correct
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  searchQuery: string = '';
  
  // viewMode: 'list' | 'card' = 'list'; // Si vous prévoyez un mode carte plus tard
  isLoading = true;
  errorMessage: string | null = null;

 selectedDocumentType: string | null = null; // Gardez celle-ci pour la logique de filtrage interne (ex: "INVOICE")
  activeDisplayType: string | null = null; // NOUVEAU: pour l'état de l'UI (ex: "FACTURE")
  
 
  readonly documentTypes: string[] = ['FACTURE', 'DEVIS',"NOTE D'HONORAIRES"]; 

  displayedColumns: string[] = [
    'documentNumber',
    'clientName',
    'createdAt',

    'totalAmount',
   
    'actions'
  ];

  constructor(
    private route: ActivatedRoute, // Peut être utilisé pour lire des paramètres de route si nécessaire
    private router: Router,
    private commercialService: CommercialService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.commercialService.getInvoices().subscribe({
      next: (data:any[]) => {
        this.invoices = data ;
        
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des factures :', err);
        this.errorMessage = `Erreur de chargement des factures. ${err.message || 'Veuillez réessayer.'}`;
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    let tempInvoices = [...this.invoices];

    // Filter by search query (documentNumber, clientName, status, documentType)
    if (query) {
      tempInvoices = tempInvoices.filter(invoice =>
         invoice.documentNumber.toLowerCase().includes(query) ||
        (invoice.client?.name && invoice.client.name.toLowerCase().includes(query)) || // Safe access to client name
        invoice.status.toLowerCase().includes(query) ||
        (invoice.documentType && invoice.documentType.toLowerCase().includes(query)) // Search in documentType
    
      );
    }
    if (this.selectedDocumentType) {
     
      tempInvoices = tempInvoices.filter(invoice => 
        invoice.documentType && invoice.documentType.toUpperCase() === this.selectedDocumentType
      );
    }
    
    this.filteredInvoices = tempInvoices;
    console.log("this.filteredInvoices after all filters", this.filteredInvoices);
  }

  setDocumentTypeFilter(displayType: string | null): void {
  this.activeDisplayType = displayType; // Met à jour le type affiché actif pour l'UI

  if (displayType === "FACTURE") {
    this.selectedDocumentType = "INVOICE"; // Valeur interne pour le filtrage
  } else if (displayType === "DEVIS") {
    this.selectedDocumentType = "QUOTE";   // Valeur interne pour le filtrage
  } else if (displayType === "NOTE D'HONORAIRES") {
    this.selectedDocumentType = "FeeNote"; // Assurez-vous que "FEENOTE" correspond à la casse de vos données après .toUpperCase()
  } else { // Si displayType est null (clic sur "Tous")
    this.selectedDocumentType = null;
  }
  this.applyFilter();
}


  

editInvoice(invoiceId: string): void {
  //this.router.navigate(['/invoice', invoiceId], { queryParams: { mode: 'edit' } });
  this.router.navigate(['/invoice', invoiceId]);
}
clearFilters(): void {
  this.searchQuery = '';
  this.selectedDocumentType = null;
  this.activeDisplayType = null; // Réinitialiser aussi activeDisplayType
  this.applyFilter();
}

viewInvoice(invoiceId: string): void {
  this.router.navigate(['/invoice', invoiceId], { queryParams: { mode: 'view' } });
}


  navigateToCreateInvoice(): void {
    this.router.navigate(['/invoice']); // Pour créer une nouvelle facture
  }

  confirmDelete(invoice: any): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      windowClass: 'confirmation-modal' // Assurez-vous que cette classe est stylée
    });
    modalRef.componentInstance.message = `Voulez-vous vraiment supprimer la facture N° ${invoice.documentNumber} ?`;

    modalRef.result.then((confirmed) => {
      if (confirmed) {
        this.deleteInvoice(invoice.id);
      }
    }).catch(() => {
      console.log('Suppression annulée par l\'utilisateur.');
    });
  }


  private deleteInvoice(id: string): void {
    this.isLoading = true; // Optionnel: indiquer un chargement pendant la suppression
    this.commercialService.deleteInvoice(id).subscribe({
      next: () => {
        console.log('Facture supprimée avec succès :', id);
        // Recharger la liste ou filtrer la facture supprimée de la liste actuelle
        this.invoices = this.invoices.filter(inv => inv.id !== id);
        this.applyFilter(); // Mettre à jour filteredInvoices
        this.isLoading = false;
        // Afficher un message de succès (par exemple avec un service de notification/snackbar)
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la facture :', err);
        this.errorMessage = `Erreur lors de la suppression de la facture. ${err.message || 'Veuillez réessayer.'}`;
        this.isLoading = false;
        // Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  getStatusClass(status: any | string): string {
    // Gérer le cas où status pourrait être une chaîne si le backend ne respecte pas strictement l'enum
    const statusString = (status as string)?.toLowerCase() || 'default';
    return `status-${statusString}`;
  }

  /* markAsPaid(invoice: any): void {
    if (!invoice || !invoice.id) {
      console.error('Tentative de marquer comme payée une facture invalide:', invoice);
      this.errorMessage = 'Impossible de mettre à jour la facture : données invalides.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null; // Cacher les erreurs précédentes

    // Préparer la charge utile pour la mise à jour.
    // Si votre backend attend l'objet complet pour un PUT, vous pourriez faire : { ...invoice, status: InvoiceStatus.PAID }
    // Si une mise à jour partielle est acceptée (PATCH-like), ceci est préférable :
    const updatePayload = { 
      companyId: invoice.company.id,
    clientId: invoice.client.id,
    documentType: invoice.documentType,
    discount: invoice.discount || 0,
    notes: invoice.notes,
    lines: invoice.lines.map((item:any) => ({
      description: item.description,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      taxRate: (Number(item.taxRate) || 0) / 100 // Convertir % en décimal pour le backend
    })),
      status: !invoice.status }; 

    this.commercialService.updateInvoice(invoice.id, updatePayload).subscribe({
      next: (updatedInvoiceFromApi) => {
        console.log('Facture marquée comme payée avec succès:', updatedInvoiceFromApi);
        const index = this.invoices.findIndex(inv => inv.id === invoice.id);
        if (index !== -1) {
          // Mettre à jour la facture dans la liste principale avec la réponse de l'API
          this.invoices[index] = updatedInvoiceFromApi;
        }
        this.applyFilter(); // Rafraîchir la liste filtrée
        this.isLoading = false;
        // Optionnel : Afficher une notification de succès (ex: avec un service de snackbar)
        // this.notificationService.showSuccess('Statut de la facture mis à jour !');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut de la facture:', err);
        this.errorMessage = err.message || 'Une erreur est survenue lors de la mise à jour du statut.';
        this.isLoading = false;
        // Optionnel : Afficher une notification d'erreur
      }
    });
  } */
}