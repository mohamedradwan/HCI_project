// public-profile.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgClass } from '@angular/common';
import { ApiService, ServiceRequestDTO, UserStatsDTO } from '../../services/api';

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
    selector: 'app-public-profile',
    standalone: true,
    imports: [NavBarComponent, AvatarComponent, BadgeComponent, ButtonComponent, NgClass],
    templateUrl: './public-profile.component.html'
})
export class PublicProfileComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private apiService = inject(ApiService);

    userId = signal<number | null>(null);
    user = signal<UserData | null>(null);
    stats = signal<UserStatsDTO | null>(null);
    userRequests = signal<ServiceRequestDTO[]>([]);
    completedRequests = signal<ServiceRequestDTO[]>([]);
    isLoading = signal(true);
    error = signal('');
    activeTab = signal<'posted' | 'completed'>('posted');

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.userId.set(parseInt(id, 10));
                this.loadUserData();
            } else {
                this.error.set('User not found');
                this.isLoading.set(false);
            }
        });
    }

    loadUserData() {
        const userId = this.userId();
        if (!userId) return;

        this.isLoading.set(true);

        // Load user details
        this.apiService.getUserById(userId).subscribe({
            next: (userData) => {
                this.user.set(userData);
            },
            error: (err) => {
                console.error('Error loading user:', err);
                this.error.set('Failed to load user data');
                this.isLoading.set(false);
            }
        });

        // Load user stats
        this.apiService.getUserStats(userId).subscribe({
            next: (statsData) => {
                this.stats.set(statsData);
            },
            error: (err) => console.error('Error loading stats:', err)
        });

        // Load user's posted requests
        this.apiService.getRequestsByUser(userId).subscribe({
            next: (requests) => {
                this.userRequests.set(requests);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading requests:', err);
                this.isLoading.set(false);
            }
        });

        // Load completed requests
        this.apiService.getCompletedRequestsByUser(userId).subscribe({
            next: (requests) => {
                this.completedRequests.set(requests);
            },
            error: (err) => console.error('Error loading completed:', err)
        });
    }

    setActiveTab(tab: 'posted' | 'completed') {
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

    navigate(screen: string) {
        this.router.navigate([`/${screen}`]);
    }
}
