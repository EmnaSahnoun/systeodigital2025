 import { Injectable } from '@angular/core';
import {   Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate  {

  constructor(
    private oauthService: OAuthService,
   private router: Router,
   private authService: AuthService,
) { }
canActivate(
  
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): Observable<boolean | UrlTree> {
  //console.log('=== AUTH GUARD DEBUG ===');
  //console.log('URL demandée:', state.url);
  //console.log('Token présent:', !!this.authService.getAccessToken());
  //console.log('Token valide:', this.authService.isAuthenticated());
  if (state.url.includes('/emails')) {
      return of(true); // Laisser GoogleAuthGuard gérer ça
    }
  if (this.authService.isAuthenticated()) {
    //console.log('Accès autorisé à', state.url);
    return of(true);
  }
// 2. Vérifier si on revient de Keycloak (présence de code et state)
const hasCode = window.location.search.includes('code=');
const hasState = window.location.search.includes('state=');
if (hasCode && hasState) {
 // console.log('AuthGuard: Code/State détectés. Attente de tryLoginCodeFlow...');
  // Ne pas décider tout de suite. Attendre la fin de tryLoginCodeFlow.
  // On retourne un Observable qui dépend du résultat de tryLoginCodeFlow.
  return from(this.oauthService.tryLoginCodeFlow()) // Convertit la promesse en Observable
    .pipe(
      switchMap(() => {
        // Ce code s'exécute APRÈS la fin de tryLoginCodeFlow
        if (this.authService.isAuthenticated()) {
         // console.log('AuthGuard: tryLoginCodeFlow terminé avec succès. Autorisation.');
          // L'authentification est confirmée. On autorise la navigation actuelle.
          // La redirection finale vers le bon dashboard sera gérée par AuthService.redirectBasedOnRole
          return of(true);
        } else {
          //console.log('AuthGuard: tryLoginCodeFlow terminé mais non authentifié. Redirection vers login.');
          // Si tryLoginCodeFlow n'a pas réussi à authentifier, on redirige vers login.
          return of(this.router.createUrlTree(['/login']));
        }
      }),
      catchError((error) => {
      //  console.error('AuthGuard: Erreur durant le traitement de tryLoginCodeFlow:', error);
        // En cas d'erreur, rediriger vers login.
        return of(this.router.createUrlTree(['/login']));
      })
    );
}
//console.log('AuthGuard: Non authentifié et pas de code/state. Redirection vers login.');
// Optionnel : Sauvegarder l'URL voulue pour y revenir après connexion
// this.authService.redirectUrl = state.url;
return of(this.router.createUrlTree(['/login']));
}
}
 