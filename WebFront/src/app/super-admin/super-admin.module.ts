import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { SuperAdminComponent } from './super-admin.component';
import { SharedModule } from '../shared/shared.module';
import { SuperAdminDashboardComponent } from './super-admin-dashboard/super-admin-dashboard.component';
import { AgencesComponent } from './agences/agences.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgenceFormComponent } from './agence-form/agence-form.component';
import { AgencyDetailsComponent } from './agency-details/agency-details.component';
import { UserFormComponent } from './user-form/user-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [
    SuperAdminComponent,
    SuperAdminDashboardComponent,
    AgencesComponent,
    AgenceFormComponent,
    AgencyDetailsComponent,
    UserFormComponent,
    
   
  ],
  imports: [
    CommonModule,
    SuperAdminRoutingModule,
    SharedModule, 
    FormsModule, 
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,  
    MatSnackBarModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatTooltipModule,
  ]                                   
})
export class SuperAdminModule { }
