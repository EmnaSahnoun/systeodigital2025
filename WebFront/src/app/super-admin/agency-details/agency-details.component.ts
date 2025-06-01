import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserFormComponent } from '../user-form/user-form.component';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../services/UserService';
import { mergeMap, map, catchError, toArray, timeout, switchMap, finalize } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AgenceService } from '../../services/agenceService';
// Import ToastrService if you use it for notifications
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-agency-details',
  templateUrl: './agency-details.component.html',
  styleUrl: './agency-details.component.scss'
})
export class AgencyDetailsComponent implements OnInit {
  @Input() agency: any;
  users: any[] = [];

  editingUserId: string | null = null; // Track the ID of the user being edited
  editedUserData: any = {}; // Temporary storage for edited data
  isLoadingUsers = false; // Flag for loading state
  isSavingUser = false; // Flag for saving state
  isDeletingUser: string | null = null; // Track which user is being deleted

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private router: Router,
    private userService: UserService,
    private agenceService: AgenceService
    // Inject ToastrService if needed
    // private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  viewProjects() {
    this.activeModal.close();
    this.router.navigate(['/super-admin/projects'], {
      queryParams: { agencyId: this.agency._id }
    });
  }

  addUser(agence: any) {
    const modalRef = this.modalService.open(UserFormComponent, {
      size: 'md',
      centered: true
    });

    modalRef.componentInstance.agencyName = agence.name;

    modalRef.result.then((result) => {
      if (result) {
        this.loadUsers(); // Reload users after adding a new one
      }
    }, () => {
      // Gestion de l'annulation (modal closed without saving)
      console.log('Add user modal dismissed');
    });
  }


  deleteUser(user: any) {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
        centered: true,
        windowClass: 'confirmation-modal'
    });

    modalRef.componentInstance.message = `Voulez-vous vraiment supprimer l'utilisateur `;
    modalRef.componentInstance.username = user.username; // Pass username for confirmation if needed

    modalRef.result.then((confirm) => {
        if (confirm) {
            this.isDeletingUser = user.id; // Set deleting flag for this user
            // Use the service method that handles both group removal and user deletion
            this.agenceService.deleteUserCompletely(user.id, this.agency.name).pipe(
                finalize(() => this.isDeletingUser = null) // Ensure flag is reset
            )
            .subscribe({
                next: () => {
                    console.log('Utilisateur supprimé avec succès');
                
                    this.users = this.users.filter(u => u.id !== user.id);
                },
                error: (err) => {
                    console.error('Erreur lors de la suppression', err);
                }
            });
        }
    }).catch(() => {
        console.log('Suppression annulée');
    });
}

  // --- Edit User Logic ---
  editUser(user: any) {
    // If another user is already being edited, cancel that first (optional)
    if (this.editingUserId && this.editingUserId !== user.id) {
        this.cancelEdit();
    }
    this.editingUserId = user.id;
    // Copy necessary properties for editing, including the ID
    this.editedUserData = {
        id: user.id, // Keep the id
        username: user.username,
        email: user.email,
        enabled: user.enabled // Include enabled status
        // We don't need firstName/lastName here if using partial update
    };
  }

  cancelEdit() {
    this.editingUserId = null;
    this.editedUserData = {};
    // No need to reset isSavingUser here, it's handled by saveUser or component init/load
  }

  saveUser() {
    if (!this.editingUserId || !this.editedUserData) {
      console.error('Cannot save, no user is being edited or data is missing.');
      return;
    }

    this.isSavingUser = true;
    const userIdToSave = this.editingUserId; // Capture ID before potential async reset
    const dataToSave = { ...this.editedUserData }; // Create a copy of the data to send
    const payload = {
        username: dataToSave.username,
        email: dataToSave.email,
        enabled: dataToSave.enabled
    };

    this.agenceService.updateUser(
        userIdToSave,
        payload,
        { partialUpdate: true } // Use partial update
      )
      .pipe(
        finalize(() => this.isSavingUser = false) // Ensure loading state is turned off
      )
      .subscribe({
        next: (/* updatedUserResponse */) => { // Keycloak PUT /users/{id} often returns 204 No Content
          console.log('User updated successfully');
          // Find the index of the user in the local array
          const index = this.users.findIndex(u => u.id === userIdToSave);
          if (index !== -1) {
            this.users[index] = {
                ...this.users[index], // Keep existing properties (like role)
                ...payload            // Apply the changes from the payload
            };
          }
          this.cancelEdit(); // Exit editing mode
          
        },
        error: (err) => {
          console.error('Failed to update user', err);
      
        }
      });
  }


  closeModal(): void {
    this.activeModal.dismiss('Cross click');
  }

  loadUsers(): void {
    this.isLoadingUsers = true; // Set loading state
    const ROLE_HIERARCHY = ['SUPER-ADMIN', 'ADMIN', 'USER']; // Define role hierarchy

    this.agenceService.getMembersByGroupName(this.agency.name).pipe(
      // Use finalize to ensure isLoadingUsers is set to false regardless of success/error
      finalize(() => this.isLoadingUsers = false),
      // Handle potential error from getMembersByGroupName itself
      catchError(err => {
        console.error('Failed to get group members', err);
        this.users = []; // Clear users on error
        // Optional: Show error message
        // this.toastr.error(`Erreur chargement membres: ${err.message || 'Erreur inconnue'}`);
        return of([]); // Return empty array to prevent breaking the stream
      }),
      // If members are found, proceed to get roles
      mergeMap(users => {
        if (!users || users.length === 0) {
          return of([]); // No users, return empty array observable
        }
        return from(users); // Process users one by one
      }),
      mergeMap(user => {
        // Fetch roles for each user
        return this.userService.getUserRoles(user.id).pipe(
          map(roles => {
            // Find the highest role based on the defined hierarchy
            const userRoles = roles.map(r => r.name.toUpperCase()); // Ensure case-insensitivity
            const highestRole = ROLE_HIERARCHY.find(role =>
              userRoles.includes(role)
            ) || 'USER'; // Default to 'USER' or 'Aucun rôle' if preferred

            return {
              ...user,
              role: highestRole // Add the determined role to the user object
            };
          }),
          // Handle errors fetching roles for a specific user
          catchError(() => of({
            ...user,
            role: 'Erreur Rôle' // Indicate role fetching error
          })),
          timeout(8000) // Add a slightly longer timeout for role fetching
        );
      }, 5), // Concurrency limit for fetching roles
      toArray() // Collect all processed users back into an array
    ).subscribe({
      next: (usersWithRoles) => {
        this.users = usersWithRoles;
        console.log("Users avec rôles:", this.users);
      },
      error: (err) => {
        // This error would likely be from the final toArray or timeout
        console.error('Failed to load users with roles', err);
        // Optional: Show error message
        // this.toastr.error(`Erreur finale chargement utilisateurs: ${err.message || 'Erreur inconnue'}`);
        this.users = []; // Clear users on final error
      }
      // No need for complete block if using finalize for loading state
    });
  }
}
