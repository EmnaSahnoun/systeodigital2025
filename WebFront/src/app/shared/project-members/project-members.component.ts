import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'; // Inject n'est plus nécessaire ici
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'; // Importer NgbActiveModal
import { ProjectService } from '../../services/ProjectService';
import { Agence } from '../../models/agence.model';
import { AgenceService } from '../../services/agenceService';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project-members',
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.scss'],
  standalone: false
})


export class ProjectMembersComponent implements OnInit {
  @Input() project: any;
  activeTab: 'current' | 'pending' | 'add' = 'current';
  members: any[] = []; // Membres acceptés (ACCEPTED)
  pendingMembers: any[] = []; // Invitations en attente (PENDING)
  usersToAdd: any[] = [];
  isLoading: boolean = false; // Pour afficher un indicateur de chargement
  selectedRole: string = 'MEMBER';
  selectedUserId: string | null = null; // ID de l'utilisateur sélectionné pour l'ajout
  viewInvitations:boolean=false;
  isAdmin:boolean=false;
  isSuperAdmin:boolean=false;
  constructor(
    public activeModal: NgbActiveModal, // Injecter NgbActiveModal
    private snackBar: MatSnackBar ,// Pour afficher des messages
    private projectService: ProjectService,
    private agenceService:AgenceService,
    private cdRef: ChangeDetectorRef,
    private authService:AuthService
    
  ) {
    
    
  }
  ngOnInit(): void {
    this.isSuperAdmin=this.authService.isSuperAdmin();
  this.isAdmin=this.authService.isAdmin();
  this.canViewInvitations()
    this.loadProjectMembers();
  }
canViewInvitations() {
  
    const idUser=localStorage.getItem("user_id");
    if (this.project.idAdmin===idUser || this.isAdmin || this.isSuperAdmin){
      this.viewInvitations=true;
    }
   else{
    this.viewInvitations=false;
  }
  
}
  loadProjectMembers(): void {
    this.isLoading = true;
    this.projectService.getProjectAccessByIdProject(this.project.id).subscribe({
      next: (accessList) => {
        console.log("les membres",accessList)
        this.members = accessList
          .filter(access => access.invitationStatus === 'ACCEPTED')
          .map(access => ({
            idAccess: access.id,
            idUser: access.idUser,
            name: access.name || `User ${access.idUser.substring(0, 4)}`,
            email: access.emailUser,
            role: access.role
          }));

        this.pendingMembers = accessList
          .filter(access => access.invitationStatus === 'PENDING')
          .map(pending => ({
            
            idAccess: pending.id,
            idUser: pending.idUser,
            emailUser: pending.emailUser,
            role: pending.role,
            createdAt: pending.createdAt
          }));

        console.log('Members:', this.members);
        this.getMemberName(this.members)
        console.log('Pending Members:', this.pendingMembers);
        this.getMemberName(this.pendingMembers)
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }
  getMemberRole(member: any): string {
    // Adaptez ceci à la structure de vos données membre/rôle
    return member?.role || 'Non défini';
  }
getMemberName(projects:any){
  projects.forEach((p:any) => {
    this.agenceService.getUserById(p.idUser).subscribe({
      next: (user) => {
        p.name=user.username
        console.log("projet",p)
      },
      error: (err) => {
        console.error('Erreur:', err);
        // Affichez un message d'erreur à l'utilisateur
        this.isLoading = false;
      }
    });
  });
}
  getMemberFullName(member: any): string {
     // Adaptez ceci à la structure de vos données membre
     return member?.name || member?.fullName || 'Nom non défini';
  }

   getMemberEmail(member: any): string {
     // Adaptez ceci à la structure de vos données membre
     return member?.email || 'Email non défini';
   }

   
   addMember(): void {
    if (!this.selectedUserId) {
      this.snackBar.open('Veuillez sélectionner un utilisateur à ajouter.', 'Fermer', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    console.log(`Tentative d'ajout du membre ID: ${this.selectedUserId} au projet ID: ${this.project.id}`);

    
     setTimeout(() => {
       const addedUser = { id: this.selectedUserId, name: `Utilisateur ${this.selectedUserId?.substring(0, 4)}`, email: `user${this.selectedUserId?.substring(0, 4)}@example.com`, role: 'Nouveau Membre', image: 'assets/images/default-avatar.png' };
       this.members.push(addedUser);
       this.snackBar.open('Membre ajouté (simulation).', 'OK', { duration: 2000 });
       this.selectedUserId = null;
       this.isLoading = false;
     }, 1000);
  }

  removeMember(memberToRemove: any): void {
    
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${this.getMemberFullName(memberToRemove)} du projet ?`)) {
      return;
    }

    this.isLoading = true;
    console.log(`Tentative de suppression du membre ID: ${memberToRemove.id} du projet ID: ${this.project.id}`);

    
     setTimeout(() => {
       this.members = this.members.filter(m => m.id !== memberToRemove.id);
       this.snackBar.open('Membre retiré (simulation).', 'OK', { duration: 2000 });
       this.isLoading = false;
     }, 1000);
  }

  closeDialog(): void {
    this.activeModal.close('Modal closed');
  }

  getMembersGroup(): void {
    this.isLoading = true;
    const agencyName = localStorage.getItem("AgencyName");
    const currentUserId = localStorage.getItem("user_id");
    
    if (agencyName) {
      this.agenceService.getMembersByGroupName(agencyName).subscribe({
        next: (members) => {
          this.usersToAdd = members.filter(user => {
            const isCurrentUser = user.id === currentUserId;
            const isAlreadyMember = this.members.some(m => m.id === user.id || m.idUser === user.id);
            const isPending = this.pendingMembers.some(m => m.idUser === user.id);
            
            return !isCurrentUser && !isAlreadyMember && !isPending;
          });
          
          console.log('Users filtered:', this.usersToAdd);
          this.isLoading = false;
          this.cdRef.detectChanges();
        },
        error: (err) => {
          console.error('Error:', err);
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }
  sendInvitation(): void {
    if (!this.selectedUserId) {
      this.snackBar.open('Veuillez sélectionner un utilisateur', 'Fermer', { duration: 3000 });
      return;
    }

    const selectedUser = this.usersToAdd.find(user => user.id === this.selectedUserId);
    console.log("le user sélectionné",selectedUser)
    if (!selectedUser) return;

    this.isLoading = true;

    const invitationData = {
      projectId: this.project.id,
      idUser: selectedUser.id,
      emailUser: selectedUser.email,
      role: this.selectedRole // Utilisez le rôle sélectionné
    };

    this.projectService.createProjectAccess(invitationData).subscribe({
      next: (newInvitation) => {
        this.pendingMembers.push(newInvitation);
        this.usersToAdd = this.usersToAdd.filter(u => u.id !== this.selectedUserId);
        this.selectedUserId = null;
        this.selectedRole = 'MEMBER'; // Réinitialisez le rôle
        
        this.snackBar.open('Invitation envoyée avec succès!', 'Fermer', { duration: 3000 });
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi de l\'invitation:', err);
        this.snackBar.open('Échec de l\'envoi de l\'invitation.', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
  cancelInvitation(member: any): void {
    this.isLoading = true;
    
    // Trouver l'ID du ProjectAccess correspondant
    const projectAccessId = member.idAccess
    this.projectService.deleteProjectAccess(projectAccessId).subscribe({
      next: () => {
          this.loadProjectMembers();
          
        this.isLoading = false;
    },
    error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        this.snackBar.open('Échec du retrait du membre', 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar'] 
        });
        this.isLoading = false;
    }
});
  }
  setActiveTab(tab: 'current' | 'pending' | 'add'): void {
    console.log('Changing active tab to:', tab); // Log pour vérifier le changement
    this.activeTab = tab;
    // Normalement, pas besoin de cdRef.detectChanges() ici, Angular détecte ce changement.
  }
}
