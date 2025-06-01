import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ClientsComponent } from './clients/clients.component';
import { MessagesComponent } from './messages/messages.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectsComponent } from './shared/projects/projects.component';
import { ProjectDetailsComponent } from './shared/project-details/project-details.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BidiModule } from '@angular/cdk/bidi';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddMemberComponent } from './add-member/add-member.component';
import { LoginComponent } from './login/login.component';

import { SharedModule } from './shared/shared.module';
import { TasksComponent } from './shared/tasks/tasks.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort'; 
import { DatePipe } from '@angular/common';
import { TaskDetailsComponent } from './shared/task-details/task-details.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ConfirmationDialogComponent } from './super-admin/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrModule } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationsComponent } from './invitations/invitations.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { SetPasswordComponent } from './set-password/set-password.component';
import { MatTabsModule } from '@angular/material/tabs';
import { EmailsComponent } from './emails/emails.component';
import { GoogleCallbackComponent } from './google-callback/google-callback.component'; // Ajout pour les onglets
import { GoogleAuthInterceptor } from './core/interceptors/google-auth.interceptor';
import { GoogleAuthService } from './services/googleAuthSerivce';
import { enableProdMode } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { EmailDetailComponent } from './email-detail/email-detail.component';
// In app.module.ts
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { EmailFormComponent } from './email-form/email-form.component';
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    SettingsComponent,
    ClientsComponent,
    MessagesComponent,
    ProfileComponent,
    ProjectsComponent,
    ProjectDetailsComponent,
    AddMemberComponent,
    LoginComponent,
   
    TasksComponent,
    TaskDetailsComponent,
    ConfirmationDialogComponent,
    InvitationsComponent,
    InvoiceListComponent,
    ClientFormComponent,
    InvoiceComponent,
    SetPasswordComponent,
    EmailsComponent,
    GoogleCallbackComponent,
    LoadingComponent,
    EmailDetailComponent,
    EmailFormComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    FormsModule,
    MatDialogModule,
    NgbModalModule,
    NgbModule,
    BidiModule,
    SharedModule,
    DragDropModule,
    OAuthModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true
    }),
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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TextFieldModule,
    MatTabsModule

  ],
  providers: [
    DatePipe,
  {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GoogleAuthInterceptor,
      multi: true
    },
    GoogleAuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
