// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ProjectFormComponent } from './project-form/project-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectMembersComponent } from './project-members/project-members.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PhaseFormComponent } from './phase-form/phase-form.component';
import { PhaseAccessComponent } from './phase-access/phase-access.component';
import { TaskFormComponent } from './task-form/task-form.component';

@NgModule({
  declarations: [HeaderComponent, ProjectFormComponent, ProjectMembersComponent, PhaseFormComponent,  PhaseAccessComponent, TaskFormComponent],
  imports: [CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    
    MatSnackBarModule,
        MatIconModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatProgressSpinnerModule,
        FormsModule, // Ajoutez FormsModule
    ReactiveFormsModule, // Si vous utilisez des formulaires réactifs ailleurs

    // Modules Material
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressBarModule,
    NgbModule
  ],
  exports: [HeaderComponent]
})
export class SharedModule { }