import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Tableau de bord';
  username: string | null = null;
  showNotifications: boolean = false;
  notifications: any[] = [];
  private userId = '50da8c53-f1bb-47cb-9d06-b31e55706ed8'; // À remplacer par l'ID réel
  
  ngOnInit(): void {
    this.loadUserProfile();   
     this.loadPendingNotifications();
    this.setupRealTimeNotifications();
  }
  loadUserProfile():void{
const userProfileString = localStorage.getItem("user_profile");

    if (userProfileString) {
      
        const userProfile = JSON.parse(userProfileString);
        this.username = userProfile?.preferred_username || null;
        if(this.username){
        localStorage.setItem("username",this.username);}
       
    } else {
      console.warn("User profile not found in localStorage.");
      this.username = null; 
    }
  }
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
  ngOnDestroy(): void {
    
  }
  private loadPendingNotifications(): void {
    
  }

  private setupRealTimeNotifications(): void {
    
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
