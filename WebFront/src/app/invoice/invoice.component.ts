import { Router,ActivatedRoute  } from '@angular/router';
import { CommercialService } from '../services/commercial.service';
import { AgenceService } from '../services/agenceService';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  constructor(private router: Router,
     private route: ActivatedRoute,
    private commercialService: CommercialService,
    private agenceService:AgenceService
  ) { }
@ViewChild('invoicePdfContent', { static: false }) invoicePdfContent!: ElementRef;

 invoice :any ={};
documentTypes: string[] = ['INVOICE', 'QUOTE', 'FeeNote'];


clients: any[] = [];
company:any={};
  subtotal = 0;
  totalTaxAmount = 0;
  total = 0;
  balance = 0;
isViewMode=false;
   addItem() {
    this.invoice.lines.push({ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }); // taxRate par défaut à 0% pour les nouveaux articles
    this.calculateTotals();
  }
  removeItem(index: number) {
    if (this.invoice.lines.length > 1) {
      this.invoice.lines.splice(index, 1);
      this.calculateTotals();
    } else {
      console.warn("Vous ne pouvez pas supprimer la dernière ligne. Au moins une ligne est requise.");
    }
  }

 calculateTotals() {
    this.subtotal = 0;
    this.totalTaxAmount = 0;

    this.invoice.lines.forEach((item:any) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const itemTaxRate = Number(item.taxRate) || 0; // Taux de TVA de l'article en %

      const itemSubtotal = quantity * unitPrice;
      this.subtotal += itemSubtotal;

      const itemTax = itemSubtotal * (itemTaxRate / 100); // Calcul de la taxe pour cet article
      this.totalTaxAmount += itemTax;
    });

    const discount = Number(this.invoice.discount) || 0;
    

    this.total = this.subtotal + this.totalTaxAmount - discount ;
    this.balance = this.total ;
  }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
    const invoiceId = params['id'];
    const mode = this.route.snapshot.queryParamMap.get('mode');
    
    this.isViewMode = mode === 'view';
    
    if (invoiceId) {

      this.loadInvoice(invoiceId);
    } else {
      console.log("new")
      
      this.initializeNewInvoice();
    }
  });


  }
  initializeNewInvoice(): void {
  this.invoice = {
      id: 0,
      documentNumber: 1,
      documentType: 'INVOICE',
      selectedClientId: null,
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      date: new Date().toISOString().split('T')[0],
    
      lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
      notes: '',

      discount: 0
    
  };
  this.calculateTotals();
  this.getClients();
  this.getCompany();
}

loadInvoice(id: string): void {
  console.log("id invoice",id)
  this.commercialService.getInvoiceById(id).subscribe({
    next: (data) => {
      this.populateInvoiceData(data);
      
    },
    error: (err) => {
      console.error('Erreur lors du chargement de la facture:', err);
      // Gérer l'erreur (redirection ou message)
    }
  });
}
populateInvoiceData(data: any): void {
  console.log("the data dnas populateInvocieData client",data.client)
  
  this.invoice=data;
 this.invoice.selectedClientId=data.client.id;
  this.invoice.clientName=data.client.name;
  this.invoice.clientAddress=data.client.address;
  this.invoice.clientPhone=data.client.phone;
  this.invoice.clientEmail=data.client.email;

   console.log("populateInvoiceData ",this.invoice)
  this.subtotal = data.subTotal;
    this.totalTaxAmount = data.taxAmount;
    this.total = data.totalAmount ;
    this.balance = this.total ;
  console.log("subtotal",this.subtotal)
  console.log("totalTaxAmount",this.totalTaxAmount)
  console.log("total",this.total )
  
  
  this.getCompany();
  
  
}
getDocumentTitle(): string {
  switch (this.invoice.documentType) {
    case 'INVOICE': return 'FACTURE';
    case 'QUOTE': return 'DEVIS';
    case 'FeeNote': return 'NOTE D\'HONORAIRES'; 
    default: return this.invoice.documentType || 'DOCUMENT';
  }
}
  onClientSelected(): void {
    if (this.invoice.selectedClientId !== null) {
       const client = this.clients.find(c => c.id === this.invoice.selectedClientId);
    
      if (client) {
        this.invoice.clientName = client.name;
        this.invoice.clientAddress = client.address;
        this.invoice.clientPhone = client.phone;
        this.invoice.clientEmail = client.email;
      }
    } else {
      // Réinitialiser les champs si aucun client n'est sélectionné
      this.invoice.clientName = '';
      this.invoice.clientAddress = '';
      this.invoice.clientPhone = '';
      this.invoice.clientEmail = '';
    
    }
}
getClients(){
  const idCompany=localStorage.getItem('idAgence');

  if (idCompany){
      this.commercialService.getClients(idCompany).subscribe({
        next: (data) => {
          this.clients  = data;
          console.log("les clients",this.clients);
     
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
    };
}
getCompany(){
  const CompanyName=localStorage.getItem('AgencyName');

  if (CompanyName){
      
       this.agenceService.getAgenceByName(CompanyName).subscribe({
        next: (data) => {
          this.company  = data;
          console.log("company",this.company);
     
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des projets:', err);
          
        }
      });
  }
}
saveInvoice() {
  if (this.invoice.id) {
    const payload = this.prepareInvoicePayload();
    this.updateExistingInvoice(this.invoice.id, payload);
  } else {
    this.createNewInvoice();
  }
}

updateExistingInvoice(id:any, payload: any) {
  
  
  this.commercialService.updateInvoice(id, payload).subscribe({
    next: (response) => {
      console.log("Facture mise à jour avec succès:", response);
      // Redirection ou message de succès
      this.router.navigate(['/invoices']);
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour:', err);
    }
  });
}

createNewInvoice() {
  const payload = this.prepareInvoicePayload();
  
  this.commercialService.createInvoice(payload).subscribe({
    next: (response) => {
      console.log("Facture créée avec succès:", response);
      // Redirection ou message de succès
      this.router.navigate(['/invoices']);
    },
    error: (err) => {
      console.error('Erreur lors de la création:', err);
    }
  });
}
prepareInvoicePayload(): any {
  const companyIdForPayload = this.company.id;

  if (!companyIdForPayload) {
    console.error('Erreur: ID de la compagnie (agence) manquant.');
    return;
  }
  if (!this.invoice.selectedClientId) {
    console.error('Erreur: Veuillez sélectionner un client.');
    return;
  }

  return {
    companyId: companyIdForPayload,
    clientId: this.invoice.selectedClientId,
    documentType: this.invoice.documentType,
    discount: Number(this.invoice.discount) || 0,
    notes: this.invoice.notes,
    lines: this.invoice.lines.map((item:any) => ({
      description: item.description,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      taxRate: (Number(item.taxRate) || 0) / 100 // Convertir % en décimal pour le backend
    }))
  };
}
public downloadInvoiceAsPDF(): void {
    const pdfContentElement = this.invoicePdfContent.nativeElement;

    // Éléments à masquer dans le PDF
    const elementsToHideInClone = [
      '.add-item', 
      '.invoice-actions', 
      '.action-cell', 
      'input', 
      'select', 
      'textarea',
      'button',
      'th:last-child', 
  'td:last-child',
  ".client-label"

    ];

    html2canvas(pdfContentElement, {
      scale: 2,
      useCORS: true,
      onclone: (documentClone: Document) => {
        // Masquer les éléments non désirés
        elementsToHideInClone.forEach(selector => {
          const elements = documentClone.querySelectorAll<HTMLElement>(selector);
          elements.forEach(el => {
            el.style.display = 'none';
          });
        });

        // Remplacer les inputs par leur valeur
        documentClone.querySelectorAll<HTMLInputElement>('input').forEach(inputEl => {
          const span = documentClone.createElement('span');
          span.textContent = inputEl.value;
          inputEl.classList.forEach(c => span.classList.add(c));
          span.style.display = 'inline-block';
          span.style.padding = '2px 5px';
          inputEl.parentNode?.replaceChild(span, inputEl);
        });

        // Remplacer les textarea
        documentClone.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(textareaEl => {
          const div = documentClone.createElement('div');
          div.textContent = textareaEl.value;
          div.style.border = '1px solid #ddd';
          div.style.padding = '5px';
          div.style.minHeight = '50px';
          textareaEl.parentNode?.replaceChild(div, textareaEl);
        });

        // Remplacer les select
        documentClone.querySelectorAll<HTMLSelectElement>('select').forEach(selectEl => {
          const span = documentClone.createElement('span');
          const selectedOption = selectEl.options[selectEl.selectedIndex];
          span.textContent = selectedOption ? selectedOption.text : selectEl.value;
          selectEl.parentNode?.replaceChild(span, selectEl);
        });

        // Ajouter la signature en bas de la facture
        const signatureDiv = documentClone.createElement('div');
        signatureDiv.style.display = 'flex';
        signatureDiv.style.justifyContent = 'space-between';
        signatureDiv.style.marginTop = '50px';
        signatureDiv.style.paddingTop = '20px';
        signatureDiv.style.borderTop = '1px solid #000';
        
        const companySignature = documentClone.createElement('div');
        companySignature.textContent = 'Signature de société';
        companySignature.style.width = '45%';
        companySignature.style.textAlign = 'center';
        
        const cachet = documentClone.createElement('div');
        cachet.textContent = 'Cachet';
        cachet.style.width = '45%';
        cachet.style.textAlign = 'center';
        
        signatureDiv.appendChild(companySignature);
        signatureDiv.appendChild(cachet);
        
        // Trouver le conteneur principal et ajouter la signature
        const container = documentClone.querySelector('.invoice-container');
        if (container) {
          container.appendChild(signatureDiv);
        }
      }
    }).then(canvas => {
      const imgWidthMM = 210;
      const pageHeightMM = 297;
      const marginMM = 10;

      const effectiveImgWidthMM = imgWidthMM - 2 * marginMM;
      const imgHeightMM = (canvas.height * effectiveImgWidthMM) / canvas.width;
      let heightLeftMM = imgHeightMM;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      let positionMM = marginMM;

      pdf.addImage(contentDataURL, 'PNG', marginMM, positionMM, effectiveImgWidthMM, imgHeightMM);
      heightLeftMM -= (pageHeightMM - 2 * marginMM);

      while (heightLeftMM > 0) {
        positionMM = marginMM - imgHeightMM + heightLeftMM;
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', marginMM, positionMM, effectiveImgWidthMM, imgHeightMM);
        heightLeftMM -= (pageHeightMM - 2 * marginMM);
      }

      const fileName = `${this.getDocumentTitle()}_${this.invoice.documentNumber || 'INV'}.pdf`;
      pdf.save(fileName);
    }).catch(error => {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    });
}
}