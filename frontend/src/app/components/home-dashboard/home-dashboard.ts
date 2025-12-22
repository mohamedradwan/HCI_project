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
  nearbyRequests = signal<any[]>([]); // Can contain both ServiceRequestDTO and ServiceOfferingDTO
  isLoading = signal(true);
  userName = signal('User');
  showOnboarding = signal(false);

  categories = ['all', 'Transportation', 'Home Repairs', 'Tutoring', 'Delivery', 'Cleaning', 'Other Services'];
  urgentFirst = signal(false);
  sortByDistance = signal(false);

  // User's location for distance calculation
  userLatitude = signal<number | null>(null);
  userLongitude = signal<number | null>(null);

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

    // Sort by distance if enabled
    if (this.sortByDistance() && this.userLatitude() !== null && this.userLongitude() !== null) {
      const userLat = this.userLatitude()!;
      const userLng = this.userLongitude()!;
      requests = [...requests].sort((a, b) => {
        const distA = this.calculateDistance(userLat, userLng, a.latitude, a.longitude);
        const distB = this.calculateDistance(userLat, userLng, b.latitude, b.longitude);
        if (distA === -1) return 1;
        if (distB === -1) return -1;
        return distA - distB;
      });
    }

    return requests;
  });

  ngOnInit() {
    this.loadUserData();
    this.loadRequests();
    this.initUserLocation(); // Get user location for distance calculation
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

      // Load user's full data including location
      this.apiService.getUserById(currentUser.userId).subscribe({
        next: (user: any) => {
          // Set user's location for distance calculation
          if (user.latitude && user.longitude) {
            this.userLatitude.set(user.latitude);
            this.userLongitude.set(user.longitude);
          }
        },
        error: (err) => console.error('Error loading user location:', err)
      });

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
        // Mock additional requests to populate the home page
        const mockRequests: ServiceRequestDTO[] = [
          {
            id: 101,
            title: 'Help moving furniture',
            category: 'Transportation',
            description: 'Need help moving a sofa and a bed to my new apartment. 4th floor, no elevator.',
            budget: '$80',
            location: 'Downtown Cairo',
            date: '2025-12-23',
            time: '14:00',
            userName: 'Mona Ahmed',
            userRating: 4.8,
            urgent: true,
            latitude: 30.0449,
            longitude: 31.2358,
            timeAgo: '2h ago'
          },
          {
            id: 102,
            title: 'Math Tutor for Calculus',
            category: 'Tutoring',
            description: 'Looking for an experienced tutor for university level calculus. Need help with derivatives and integrals.',
            budget: '$30/hr',
            location: 'Maadi',
            date: '2025-12-22',
            time: '18:00',
            userName: 'Sherif Zeyad',
            userRating: 4.5,
            urgent: false,
            latitude: 29.9602,
            longitude: 31.2569,
            timeAgo: '5h ago'
          },
          {
            id: 103,
            title: 'Leaking Faucet in Kitchen',
            category: 'Home Repairs',
            description: 'My kitchen faucet is leaking constantly. Need someone to come and fix it or replace the washer.',
            budget: '$40',
            location: 'Zamalek',
            date: '2025-12-21',
            time: '15:30',
            userName: 'Layla Mahmoud',
            userRating: 4.9,
            urgent: false,
            latitude: 30.0631,
            longitude: 31.2211,
            timeAgo: '1h ago'
          },
          {
            id: 104,
            title: 'Grocery Shopping & Delivery',
            category: 'Delivery',
            description: 'I need someone to pick up a list of groceries from the supermarket and deliver them to my home.',
            budget: '$15 + items',
            location: 'New Cairo',
            date: '2025-12-21',
            time: '12:00',
            userName: 'Tarek Fathy',
            userRating: 4.2,
            urgent: true,
            latitude: 30.0263,
            longitude: 31.4117,
            timeAgo: '30m ago'
          },
          {
            id: 105,
            title: 'Dog Walking - 1 Hour',
            category: 'Other Services',
            description: 'Need someone to walk my Golden Retriever for an hour while I am at work.',
            budget: '$10',
            location: 'Nasr City',
            date: '2025-12-22',
            time: '09:00',
            userName: 'Heba Ali',
            userRating: 4.7,
            urgent: false,
            latitude: 30.0566,
            longitude: 31.3301,
            timeAgo: '8h ago'
          },
          {
            id: 106,
            title: 'Professional House Cleaning',
            category: 'Cleaning',
            description: '3-bedroom apartment needs deep cleaning, including windows and kitchen appliances.',
            budget: '$120',
            location: 'Dokki',
            date: '2025-12-24',
            time: '08:30',
            userName: 'Omnia Samir',
            userRating: 5.0,
            urgent: false,
            latitude: 30.0396,
            longitude: 31.2139,
            timeAgo: '1 day ago'
          }
        ];

        // Mock additional offerings to populate the home page
        const mockOfferings: any[] = [
          {
            id: 201,
            title: 'Professional Graphic Design',
            category: 'Other Services',
            description: 'Can design logos, social media posts, and branding materials.',
            price: '$25/hr',
            userName: 'Yasmine Hassan',
            userRating: 4.9,
            isOffering: true, // Marker for template
            latitude: 30.0444,
            longitude: 31.2357,
            location: 'Remote / Cairo'
          },
          {
            id: 202,
            title: 'Expert Plumbing Services',
            category: 'Home Repairs',
            description: 'Fixing all types of leaks, installing water heaters, and pipe maintenance.',
            price: '$50/visit',
            userName: 'Hassan Naguib',
            userRating: 4.6,
            isOffering: true,
            latitude: 30.0561,
            longitude: 31.3301,
            location: 'Nasr City'
          }
        ];

        // Combine all
        this.nearbyRequests.set([...requests, ...mockRequests, ...mockOfferings]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading.set(false);
        // Fallback to only mock requests/offerings on error
        this.nearbyRequests.set([
          { id: 101, title: 'Help moving furniture', category: 'Transportation', budget: '$80', location: 'Downtown', userName: 'Mona', userRating: 4.8, urgent: true, latitude: 30.0449, longitude: 31.2358 },
          { id: 201, title: 'Graphic Design', category: 'Other Services', price: '$25/hr', userName: 'Yasmine', userRating: 4.9, isOffering: true, latitude: 30.0444, longitude: 31.2357 }
        ]);
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

  startChat(request: any, event: Event): void {
    event.stopPropagation();
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      this.router.navigate(['/auth']);
      return;
    }

    // For offerings, the recipient is the person who posted it (userId)
    // For requests, the recipient is also the person who posted it (userId)
    const recipientId = request.userId;
    if (recipientId) {
      this.router.navigate(['/chat'], {
        queryParams: { recipientId: recipientId }
      });
    } else {
      // For mock data without userId, we use a fixed ID for demo purposes
      this.router.navigate(['/chat'], {
        queryParams: { recipientId: 101 }
      });
    }
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

  // Haversine formula for calculating distance between two points
  calculateDistance(lat1: number, lon1: number, lat2?: number, lon2?: number): number {
    if (!lat2 || !lon2 || lat1 === 0 || lon1 === 0) {
      return -1; // Invalid coordinates
    }

    const R = 6371; // Radius of Earth in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Distance in km, 1 decimal
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get distance for display in template - uses Cairo center as fallback
  getDistance(lat?: number, lng?: number): string | null {
    if (!lat || !lng) {
      return null;
    }
    // Use user location if available, otherwise default to Cairo center
    const userLat = this.userLatitude() || 30.0444; // Cairo center
    const userLng = this.userLongitude() || 31.2357;

    const dist = this.calculateDistance(userLat, userLng, lat, lng);
    if (dist === -1) return null;
    return dist.toString();
  }

  // Initialize user location for distance calculation
  initUserLocation(): void {
    // Set Cairo as default immediately so distance shows right away
    if (this.userLatitude() === null) {
      this.userLatitude.set(30.0444);
      this.userLongitude.set(31.2357);
    }

    // Then try to get actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude.set(position.coords.latitude);
          this.userLongitude.set(position.coords.longitude);
        },
        (error) => {
          console.warn('Could not get user location, using Cairo center:', error);
        }
      );
    }
  }
}
