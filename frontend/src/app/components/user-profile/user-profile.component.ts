// user-profile.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf } from '@angular/common';
import { ApiService, ServiceRequestDTO, UserStatsDTO } from '../../services/api';
import { AuthService } from '../../services/auth.service';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalReviews: number;
  completedTasks: number;
  verified: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NavBarComponent, AvatarComponent, BadgeComponent, ButtonComponent],
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  user = signal<UserData | null>(null);
  stats = signal<UserStatsDTO | null>(null);
  userRequests = signal<ServiceRequestDTO[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.isLoading.set(true);

    // Load user details
    this.apiService.getUserById(currentUser.userId).subscribe({
      next: (userData) => {
        this.user.set(userData);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error.set('Failed to load user data');
      }
    });

    // Load user stats
    this.apiService.getUserStats(currentUser.userId).subscribe({
      next: (statsData) => {
        this.stats.set(statsData);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });

    // Load user's requests
    this.apiService.getRequestsByUser(currentUser.userId).subscribe({
      next: (requests) => {
        this.userRequests.set(requests);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.isLoading.set(false);
      }
    });
  }

  getInitials(): string {
    const name = this.user()?.name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-slate-100 text-slate-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  viewRequest(requestId: number) {
    this.router.navigate(['/details'], { queryParams: { id: requestId } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigate(screen: string) {
    this.router.navigate([`/${screen}`]);
  }
}
