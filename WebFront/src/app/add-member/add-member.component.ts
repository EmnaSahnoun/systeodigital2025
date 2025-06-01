import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
  standalone: false
})
export class AddMemberComponent {
availableMembers: any[];
selectedMember: any;  
selectedPhase: any;
  constructor(private modalService: NgbModal,
    public dialogRef: MatDialogRef<AddMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { availableMembers: any[] }
  ) {
    this.availableMembers = data.availableMembers;
  }
// Méthode pour ajouter un membre
// AddMemberComponent

addMember(member: any): void {
  if (this.selectedPhase) {
    this.selectedPhase.members.push(member);  // Ajouter le membre à la phase
  }

  console.log('Membre ajouté:', member);

  // Fermer le modal et retourner le membre ajouté
  this.dialogRef.close(member);
}


selectMember(member: any): void {
  this.selectedMember = member;  // Mémorise le membre sélectionné
}
open(content:any) {
  this.modalService.open(content);
}

close() {
  this.modalService.dismissAll(); // Ferme tous les modals ouverts
}

}
