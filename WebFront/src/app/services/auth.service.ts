import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../config/auth.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
private googleAccessToken = new BehaviorSubject<string | null>(null);
  googleAccessToken$ = this.googleAccessToken.asObservable();
    constructor(
        private oauthService: OAuthService,
        private router: Router,
    private http: HttpClient
      ) {
        this.configureAuth();
      }
      private configureAuth(): void {
        this.oauthService.configure(authConfig);
        
        // Désactive la tentative de login automatique après le discovery
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Discovery document loaded');
          this.oauthService.tryLoginCodeFlow().then(() => {
            if (this.oauthService.hasValidAccessToken()) {
              this.storeTokenData();
              this.redirectBasedOnRole();
            }
          });
        });
      
        // active le silent refresh  
        this.oauthService.setupAutomaticSilentRefresh();
      }
   
      redirectBasedOnRole(): void {      
        if (this.isSuperAdmin()) {
          console.log('Redirection vers le dashboard SUPER-ADMIN');
          this.router.navigate(['/super-admin/dashboard']); 
        } else if (this.isUser() || this.isAdmin()) {
          console.log('Redirection vers le dashboard ');
          this.router.navigate(['/dashboard']); 
        } else {
          console.warn('Utilisateur authentifié sans rôle reconnu (SUPER-ADMIN, ADMIN, USER). Redirection vers dashboard par défaut.');
          this.router.navigate(['/dashboard']); 
        }
      }
    
      private storeTokenData(): void {
        const token = this.oauthService.getAccessToken();
        const claims = this.oauthService.getIdentityClaims();
        const expiration = this.oauthService.getAccessTokenExpiration();
    
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("expiration", expiration.toString());
          
          // Stocker d'autres informations utilisateur si nécessaire
          if (claims) {
            localStorage.setItem('user_profile', JSON.stringify(claims));
          }
        }
      }
    
      login(): void {
        this.oauthService.initCodeFlow();
        //this.oauthService.getAccessToken();
      }
    
      logout(): void {
        
        this.oauthService.logOut();
        this.clearTokenData();
        
        
      }
      private clearTokenData(): void {
       localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('user_profile');
      }

      getAccessToken(): string | null {
      const token =  this.oauthService.getAccessToken();
      if(token){
   
        localStorage.setItem("token",token);
       
        return token;
      }
      return localStorage.getItem('token');
      } 
    
      isAuthenticated(): boolean {
        return !!this.oauthService.getAccessToken() && this.oauthService.hasValidAccessToken();
      }
      getDecodedToken(): any | null {
        const token = this.getAccessToken();
        if (token) {
          try {
            console.log("Décodage du token:", jwtDecode(token))
            return jwtDecode(token);
          } catch (error) {
            console.error("Erreur lors du décodage du token:", error);
            return null;
          }
        }
        return null;
      }
      // Méthode pour vérifier si l'utilisateur est SUPER-ADMIN
      isSuperAdmin(): boolean {
        const decodedToken = this.getDecodedToken();
    
        if (decodedToken && decodedToken.realm_access && Array.isArray(decodedToken.realm_access.roles)) {
          // Vérifie si le tableau 'roles' inclut 'SUPER-ADMIN' (insensible à la casse si nécessaire)
          return decodedToken.realm_access.roles.some(
            (role: string) => role.toUpperCase() === 'SUPER-ADMIN'
          );
        }
    
        return false; 
            }

      // Méthode pour vérifier si l'utilisateur est ADMIN
      isAdmin(): boolean {
        const decodedToken = this.getDecodedToken();
    
        if (decodedToken && decodedToken.realm_access && Array.isArray(decodedToken.realm_access.roles)) {
          // Vérifie si le tableau 'roles' inclut 'ADMIN' (insensible à la casse si nécessaire)
          return decodedToken.realm_access.roles.some(
            (role: string) => role.toUpperCase() === 'ADMIN'
          );
        }
    
        return false;  
      }

      // Méthode pour vérifier si l'utilisateur est USER
      isUser(): boolean {
        const decodedToken = this.getDecodedToken();
    
        if (decodedToken && decodedToken.realm_access && Array.isArray(decodedToken.realm_access.roles)) {
          // Vérifie si le tableau 'roles' inclut 'USER' (insensible à la casse si nécessaire)
          return decodedToken.realm_access.roles.some(
            (role: string) => role.toUpperCase() === 'USER'
          );
        }
    
        return false; 
      }
 
      

      
}