// user-profile.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
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
  avatarUrl?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NavBarComponent, AvatarComponent, BadgeComponent, ButtonComponent, NgClass],
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  user = signal<UserData | null>(null);
  stats = signal<UserStatsDTO | null>(null);
  userRequests = signal<ServiceRequestDTO[]>([]);
  completedRequests = signal<ServiceRequestDTO[]>([]);
  inProgressRequests = signal<ServiceRequestDTO[]>([]);
  helperCompletedTasks = signal<ServiceRequestDTO[]>([]);
  isLoading = signal(true);
  error = signal('');
  activeTab = signal<'my-requests' | 'in-progress' | 'completed' | 'helped'>('my-requests');

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

    // Load completed requests (user created)
    this.apiService.getCompletedRequestsByUser(currentUser.userId).subscribe({
      next: (requests) => {
        this.completedRequests.set(requests);
      },
      error: (err) => console.error('Error loading completed:', err)
    });

    // Load tasks user ACCEPTED as helper (in-progress)
    this.apiService.getAcceptedTasksByHelper(currentUser.userId).subscribe({
      next: (requests) => {
        this.inProgressRequests.set(requests);
      },
      error: (err) => console.error('Error loading accepted tasks:', err)
    });

    // Load tasks user COMPLETED as helper
    this.apiService.getCompletedTasksByHelper(currentUser.userId).subscribe({
      next: (requests) => {
        this.helperCompletedTasks.set(requests);
      },
      error: (err) => console.error('Error loading helper completed:', err)
    });
  }

  setActiveTab(tab: 'my-requests' | 'in-progress' | 'completed' | 'helped') {
    this.activeTab.set(tab);
  }

  getInitials(): string {
    const name = this.user()?.name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'IN_PROGRESS': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'COMPLETED': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  }

  viewRequest(requestId: number) {
    this.router.navigate(['/details'], { queryParams: { id: requestId } });
  }

  cancelRequest(requestId: number, event: Event) {
    event.stopPropagation();
    this.apiService.cancelRequest(requestId).subscribe({
      next: () => {
        // Reload data after cancellation
        this.loadUserData();
      },
      error: (err) => console.error('Error cancelling:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  navigate(screen: string) {
    this.router.navigate([`/${screen}`]);
  }

  avatarUrl = signal<string | null>(null);

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      this.avatarUrl.set(base64);

      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.apiService.uploadAvatar(currentUser.userId, base64).subscribe({
          next: () => {
            console.log('Avatar uploaded successfully');
            // Update local user data
            const userData = this.user();
            if (userData) {
              this.user.set({ ...userData, avatarUrl: base64 });
            }
          },
          error: (err) => console.error('Error uploading avatar:', err)
        });
      }
    };

    reader.readAsDataURL(file);
  }
}
