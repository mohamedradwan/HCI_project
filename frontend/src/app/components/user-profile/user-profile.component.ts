// user-profile.component.ts
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
  address?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NavBarComponent, AvatarComponent, BadgeComponent, ButtonComponent, NgClass],
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private routeSub: Subscription | undefined;

  user = signal<UserData | null>(null);
  stats = signal<UserStatsDTO | null>(null);
  userRequests = signal<ServiceRequestDTO[]>([]);
  completedRequests = signal<ServiceRequestDTO[]>([]);
  inProgressRequests = signal<ServiceRequestDTO[]>([]);
  helperCompletedTasks = signal<ServiceRequestDTO[]>([]);
  isLoading = signal(true);
  error = signal('');
  activeTab = signal<'my-requests' | 'in-progress' | 'completed' | 'helped'>('my-requests');

  // Privacy logic
  currentUser = this.authService.currentUser;
  isOwnProfile = computed(() => {
    const user = this.user();
    const current = this.currentUser();
    return user && current && user.id === current.userId;
  });

  getDisplayAddress = computed(() => {
    const user = this.user();
    if (!user || !user.address) return null;

    // If it's my profile, show full address
    if (this.isOwnProfile()) return user.address;

    // If other person, show simplified address (last 2 parts usually City/Area)
    const parts = user.address.split(',').map(p => p.trim());
    console.log('Address Parts:', parts); // DEBUG
    if (parts.length <= 2) return user.address;

    // Return last 2 parts (e.g. "Maadi, Cairo")
    return parts.slice(-2).join(', ');
  });

  ngOnInit() {
    // Handle both /profile/:id AND /user?id=1
    this.routeSub = this.route.queryParams.subscribe(queryParams => {
      const queryId = queryParams['id'];
      if (queryId) {
        this.loadUserData(Number(queryId));
      } else {
        // If no query param, check path param (e.g. /profile/1)
        const pathId = this.route.snapshot.params['id'];
        this.loadUserData(pathId ? Number(pathId) : null);
      }
    });

    // Also subscribe to params for direct /profile/:id changes
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadUserData(Number(params['id']));
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadUserData(routeProfileId: number | null) {
    const currentUser = this.authService.currentUser();
    const profileId = routeProfileId || (currentUser ? currentUser.userId : null);

    if (!profileId) {
      this.router.navigate(['/auth']);
      return;
    }

    console.log('Loading profile for User ID:', profileId);

    this.isLoading.set(true);

    // Load user details
    this.apiService.getUserById(profileId).subscribe({
      next: (userData) => {
        console.log('API Returned User Data:', userData); // DEBUG LOG
        this.user.set(userData);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error.set('Failed to load user data');
      }
    });

    // Load user stats
    this.apiService.getUserStats(profileId).subscribe({
      next: (statsData) => {
        this.stats.set(statsData);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });

    // Load user's requests (exclude completed/paid - those go in "My Completed")
    this.apiService.getRequestsByUser(profileId).subscribe({
      next: (requests) => {
        // Only show OPEN and IN_PROGRESS in "My Requests"
        const activeRequests = requests.filter(r =>
          r.status !== 'COMPLETED' && r.status !== 'PAID'
        );
        this.userRequests.set(activeRequests);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.isLoading.set(false);
      }
    });

    // Only load private/my-task info if viewing own profile
    if (currentUser && currentUser.userId === profileId) {
      // Load completed requests (user created)
      this.apiService.getCompletedRequestsByUser(profileId).subscribe({
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
      this.apiService.getCompletedTasksByHelper(profileId).subscribe({
        next: (requests) => {
          this.helperCompletedTasks.set(requests);
        },
        error: (err) => console.error('Error loading helper completed:', err)
      });
    } else {
      // If viewing someone else, clear lists
      this.completedRequests.set([]);
      this.inProgressRequests.set([]);
      this.helperCompletedTasks.set([]);
    }
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
        const currentUser = this.authService.currentUser();
        this.loadUserData(currentUser ? currentUser.userId : null);
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
