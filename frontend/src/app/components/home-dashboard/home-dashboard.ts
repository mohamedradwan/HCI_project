// home-dashboard.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { NgFor, NgIf } from '@angular/common';
import { ApiService, ServiceRequestDTO, UserStatsDTO } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, BadgeComponent, AvatarComponent, NgFor, NgIf],
  templateUrl: './home-dashboard.component.html'
})
export class HomeDashboardComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  selectedCategory = signal('all');
  stats = signal<any[]>([]);
  nearbyRequests = signal<ServiceRequestDTO[]>([]);
  isLoading = signal(true);
  userName = signal('User');

  ngOnInit() {
    this.loadUserData();
    this.loadRequests();
  }

  loadUserData() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.userName.set(currentUser.name);

      // Load user stats
      this.apiService.getUserStats(currentUser.userId).subscribe({
        next: (stats) => {
          this.stats.set([
            { icon: '✅', label: 'Completed Tasks', value: stats.completedTasks.toString(), color: 'text-green-600 bg-green-100' },
            { icon: '📈', label: 'This Month', value: stats.thisMonth.toString(), color: 'text-blue-600 bg-blue-100' },
            { icon: '👥', label: 'Active Clients', value: stats.activeClients.toString(), color: 'text-orange-600 bg-orange-100' },
            { icon: '⭐', label: 'Avg Rating', value: stats.avgRating.toFixed(1), color: 'text-amber-600 bg-amber-100' }
          ]);
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          // Use default stats on error
          this.stats.set([
            { icon: '✅', label: 'Completed Tasks', value: '0', color: 'text-green-600 bg-green-100' },
            { icon: '📈', label: 'This Month', value: '0', color: 'text-blue-600 bg-blue-100' },
            { icon: '👥', label: 'Active Clients', value: '0', color: 'text-orange-600 bg-orange-100' },
            { icon: '⭐', label: 'Avg Rating', value: '0.0', color: 'text-amber-600 bg-amber-100' }
          ]);
        }
      });
    }
  }

  loadRequests() {
    this.isLoading.set(true);
    this.apiService.getAllOpenRequests().subscribe({
      next: (requests) => {
        this.nearbyRequests.set(requests);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading.set(false);
        // Set empty array on error
        this.nearbyRequests.set([]);
      }
    });
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }

  viewRequestDetails(requestId: number): void {
    this.router.navigate(['/details'], { queryParams: { id: requestId } });
  }
}
