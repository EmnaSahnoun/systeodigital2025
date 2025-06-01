import { Component, OnInit } from '@angular/core';
import { NavigationStart, NavigationEnd, Router, NavigationCancel, NavigationError } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { authConfig } from './config/auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'WebFront';
  showSidebar = true;
  private lastNavigationUrl: string | null = null;

  constructor(
    private router: Router,
    private oauthService: OAuthService,
    private authService: AuthService
  ) {
    // Configuration de base de OAuth (si nécessaire ici)
    this.oauthService.configure(authConfig);
  }

  ngOnInit() {
    this.setupNavigationMonitoring();
  }

  private setupNavigationMonitoring(): void {
    // Surveille toutes les navigations
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started to:', event.url);
        this.lastNavigationUrl = event.url;
      }

      if (event instanceof NavigationEnd) {
        console.log('Navigation ended at:', event.url);
        this.updateSidebarVisibility(event.url);
      }

      if (event instanceof NavigationCancel) {
        console.warn('Navigation cancelled:', event.reason);
      }

      if (event instanceof NavigationError) {
        console.error('Navigation error:', event.error);
      }
    });

    // Surveillance spécifique pour les redirections après login
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter(() => this.authService.isAuthenticated())
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/dashboard' && this.lastNavigationUrl?.startsWith('/super-admin')) {
        console.log('Redirection non désirée détectée, correction...');
        this.router.navigateByUrl(this.lastNavigationUrl, { replaceUrl: true });
      }
    });
  }

  private updateSidebarVisibility(url: string): void {
    this.showSidebar = !['/login', '/signup'].includes(url);
  }
}