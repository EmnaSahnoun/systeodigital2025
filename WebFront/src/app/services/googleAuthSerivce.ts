// google-auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  accessToken$ = this.accessTokenSubject.asObservable();

  private readonly ACCESS_TOKEN_KEY = 'google_access_token';
  private readonly REFRESH_TOKEN_KEY = 'google_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'google_token_expiry';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (token) {
      this.accessTokenSubject.next(token);
    }
  }

  initGoogleAuth(returnUrl: string ): void {
  localStorage.setItem('google_return_url', returnUrl);
    window.location.href = `https://e8.systeo.tn/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
 }

  async handleCallback(): Promise<boolean> {
    try {
      const url = new URL(window.location.href);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const expiresIn = url.searchParams.get('expires_in');
      const state = url.searchParams.get('state');

      console.log('Paramètres reçus:', { accessToken, refreshToken }); // Debug

      if (!accessToken || !refreshToken) {
        console.error('Tokens manquants dans l\'URL');
        return false;
      }

      this.setTokens(accessToken, refreshToken, expiresIn);
      
      // Nettoyer l'URL
      const cleanUrl = window.location.origin + (state || '/emails');
      window.history.replaceState({}, document.title, cleanUrl);
      
      return true;
    } catch (error) {
      console.error('Erreur dans handleCallback:', error);
      return false;
    }
  }

  private setTokens(accessToken: string, refreshToken: string, expiresIn: string | null): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    
    const expiryDate = expiresIn ? 
      Date.now() + (parseInt(expiresIn) * 1000) : 
      Date.now() + 3600 * 1000;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toString());
    
    this.accessTokenSubject.next(accessToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.http.post<any>('https://e8.systeo.tn/auth/refresh-token', {
        refresh_token: refreshToken
      }).toPromise();

      this.setTokens(
        response.access_token, 
        response.refresh_token || refreshToken, // Garder l'ancien refresh token si nouveau non fourni
        response.expiry_date
      );

      return response.access_token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.accessTokenSubject.next(null);
    this.router.navigate(['/login']);
  }
}