import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Import necessary decorators and interfaces
import { MatTableDataSource } from '@angular/material/table';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';

// Define the Agency interface for strong typing
export interface Agency {
  id: number;
  name: string;
  status: 'active' | 'inactive'; // Use specific types instead of 'any'
  userCount: number;
  // Optional properties added by prepareAgencyDataForDisplay
  statusText?: string;
  statusClass?: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss'] // Corrected: Use styleUrls and .scss extension
})
// Implement the interfaces correctly
export class SuperAdminDashboardComponent implements AfterViewInit, OnDestroy {

  // --- Propriétés pour les cartes statistiques ---
  agencyCount: number = 0;
  projectCount: number = 0;
  userCount: number = 0;

  // --- Propriétés pour la section activité ---
  totalTasks: number = 0;
  activeMembers: number = 0;
  activeProjects: number = 0;
  private chartInstance: Chart | null = null;
  private chartUpdateSubscription: Subscription | null = null;

  // --- Propriétés pour la table des agences ---
  // Use the Agency interface for MatTableDataSource
  agencyDataSource = new MatTableDataSource<Agency>([]);
  agencyDisplayedColumns: string[] = ['name', 'userCount', 'status', 'actions'];

  // --- Indicateurs de chargement ---
  isLoadingStats: boolean = true;
  isLoadingChart: boolean = true;
  isLoadingAgencies: boolean = true;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.chartUpdateSubscription?.unsubscribe();
  }

  loadDashboardData(): void {
    this.isLoadingStats = true;
    this.isLoadingChart = true;
    this.isLoadingAgencies = true;

    setTimeout(() => {
      this.agencyCount = 12;
      this.projectCount = 64;
      this.userCount = 105;
      this.isLoadingStats = false;

      this.totalTasks = 56;
      this.activeMembers = 8;
      this.activeProjects = 30;
      this.isLoadingChart = false;
      this.createOrUpdateChart();

      // Use the Agency interface for the sample data
      const agencies: Agency[] = [
        { id: 1, name: 'Agence Paris Centre', status: 'active', userCount: 15 },
        { id: 2, name: 'Agence Lyon Sud', status: 'active', userCount: 8 },
        { id: 3, name: 'Agence Lille Nord', status: 'inactive', userCount: 5 },
      ];
      this.agencyDataSource.data = this.prepareAgencyDataForDisplay(agencies);
      this.isLoadingAgencies = false;

      this.changeDetectorRef.detectChanges();
    }, 1500);
  }

  // Use the Agency interface for input and output types
  prepareAgencyDataForDisplay(agencies: Agency[]): Agency[] {
    return agencies.map(agency => ({
      ...agency,
      statusText: agency.status === 'active' ? 'Actif' : 'Inactif',
      statusClass: agency.status === 'active' ? 'status-active' : 'status-inactive'
    }));
  }

  createOrUpdateChart(): void {
    const canvas = document.getElementById('superAdminTaskChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas element 'superAdminTaskChart' not found.");
      return;
    }

    this.chartInstance?.destroy();

    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Projets Créés',
          data: [10, 15, 8, 12, 20, 18],
          backgroundColor: 'rgba(74, 144, 226, 0.6)',
          borderColor: 'rgba(74, 144, 226, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
           label: 'Utilisateurs Ajoutés',
           data: [5, 8, 10, 7, 12, 9],
           backgroundColor: 'rgba(80, 227, 194, 0.6)',
           borderColor: 'rgba(80, 227, 194, 1)',
           borderWidth: 1,
           borderRadius: 4,
         }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e0e0e0' },
            ticks: { color: '#666' }
          },
          x: {
             grid: { display: false },
             ticks: { color: '#666' }
           }
        },
        plugins: {
          legend: {
            position: 'top',
             labels: { color: '#333', padding: 20 }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 4,
          }
        }
      }
    });
  }

  // --- Méthodes d'action (placeholders) ---
  addNewAgency(): void {
    console.log('Ajouter une nouvelle agence...');
    // Implement logic (e.g., open modal, navigate)
  }

  // Use the Agency interface for the parameter type
  viewAgency(agency: Agency): void {
    console.log('Voir agence:', agency);
    // Implement logic
  }

  // Use the Agency interface for the parameter type
  editAgency(agency: Agency): void {
    console.log('Modifier agence:', agency);
    // Implement logic
  }

  // Use the Agency interface for the parameter type
  deleteAgency(agency: Agency): void {
    console.log('Supprimer agence:', agency);
    // Implement logic (with confirmation)
  }
}
