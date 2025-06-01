import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: '<div>Redirection vers le portail d\'authentification...</div>',
  standalone: false

})
export class LoginComponent  {
  constructor(private authService: AuthService , private router:Router) {
    
    this.authService.login();
  }

  
  

  onLogin() {
   
    this.authService.login();
    
  }
}
