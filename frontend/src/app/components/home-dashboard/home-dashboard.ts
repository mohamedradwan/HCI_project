// home-dashboard.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { OnboardingComponent } from '../../shared/components/onboarding/onboarding.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ServiceRequestDTO, UserStatsDTO } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, BadgeComponent, AvatarComponent, OnboardingComponent, NgFor, NgIf, NgClass, FormsModule],
  templateUrl: './home-dashboard.component.html'
})
export class HomeDashboardComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  selectedCategory = signal('all');
  searchQuery = signal('');
  stats = signal<any[]>([]);
  nearbyRequests = signal<ServiceRequestDTO[]>([]);
  isLoading = signal(true);
  userName = signal('User');
  showOnboarding = signal(false);

  categories = ['all', 'Transportation', 'Home Repairs', 'Tutoring', 'Delivery', 'Cleaning', 'Other Services'];
  urgentFirst = signal(false);

  // Filtered requests based on category, search, and urgent sort
  filteredRequests = computed(() => {
    let requests = this.nearbyRequests();

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      requests = requests.filter(r => r.category === this.selectedCategory());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      requests = requests.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query)
      );
    }

    // Sort urgent first if enabled
    if (this.urgentFirst()) {
      requests = [...requests].sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return 0;
      });
    }

    return requests;
  });

  ngOnInit() {
    this.loadUserData();
    this.loadRequests();
    // Check if user needs onboarding
    if (!localStorage.getItem('5alasly-onboarded')) {
      this.showOnboarding.set(true);
    }
  }

  onboardingComplete() {
    this.showOnboarding.set(false);
  }

  loadUserData() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.userName.set(currentUser.name);

      // Load user stats
      this.apiService.getUserStats(currentUser.userId).subscribe({
        next: (stats) => {
          this.stats.set([
            { icon: '✅', label: 'Completed Tasks', value: stats.completedTasks.toString(), color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' },
            { icon: '📈', label: 'This Month', value: stats.thisMonth.toString(), color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' },
            { icon: '👥', label: 'Active Clients', value: stats.activeClients.toString(), color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30' },
            { icon: '⭐', label: 'Avg Rating', value: stats.avgRating.toFixed(1), color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' }
          ]);
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          // Use default stats on error
          this.stats.set([
            { icon: '✅', label: 'Completed Tasks', value: '0', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' },
            { icon: '📈', label: 'This Month', value: '0', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' },
            { icon: '👥', label: 'Active Clients', value: '0', color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30' },
            { icon: '⭐', label: 'Avg Rating', value: '0.0', color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' }
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

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }

  viewRequestDetails(requestId: number): void {
    this.router.navigate(['/details'], { queryParams: { id: requestId } });
  }

  shareRequest(requestId: number, event: Event): void {
    event.stopPropagation(); // Prevent navigating to details
    const url = `${window.location.origin}/details?id=${requestId}`;
    navigator.clipboard.writeText(url).then(() => {
      // Show a brief notification
      const button = event.target as HTMLElement;
      const originalText = button.innerText;
      button.innerText = '✓';
      setTimeout(() => button.innerText = originalText, 2000);
    });
  }
}
