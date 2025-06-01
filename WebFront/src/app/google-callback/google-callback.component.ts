import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GoogleAuthService } from '../services/googleAuthSerivce';
import { lastValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-google-callback',
   template: `
    <div *ngIf="!error; else errorBlock">
      <p>Connexion en cours...</p>
      <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    </div>
    <ng-template #errorBlock>
      <p>Échec de la connexion Google</p>
      <button mat-button (click)="retry()">Réessayer</button>
    </ng-template>
  `
})
export class GoogleCallbackComponent implements OnInit {
  error = false;
  constructor(
    private googleAuth: GoogleAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

   async ngOnInit() {
    await this.processCallback();
  }

  private async processCallback() {
    try {
      const success = await this.googleAuth.handleCallback();
      
      if (success) {
        const returnUrl = this.getReturnUrl();
        console.log('Redirection vers:', returnUrl); // Debug
        await this.router.navigateByUrl(returnUrl);
      } else {
        this.error = true;
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      this.error = true;
    }
  }

  private getReturnUrl(): string {
    const url = new URL(window.location.href);
    return url.searchParams.get('state') || '/emails';
  }

  retry() {
    this.error = false;
    this.processCallback();
  }
}
