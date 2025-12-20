// request-details.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { NgIf } from '@angular/common';
import { ApiService, ServiceRequestDTO } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, AvatarComponent, BadgeComponent],
  templateUrl: './request-details.component.html'
})
export class RequestDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  request = signal<ServiceRequestDTO | null>(null);
  isLoading = signal(true);
  isAccepting = signal(false);
  error = signal('');
  successMessage = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadRequest(parseInt(id));
      } else {
        this.error.set('No request ID provided');
        this.isLoading.set(false);
      }
    });
  }

  loadRequest(id: number) {
    this.isLoading.set(true);
    this.apiService.getRequestById(id).subscribe({
      next: (data) => {
        this.request.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading request:', err);
        this.error.set('Failed to load request details');
        this.isLoading.set(false);
      }
    });
  }

  acceptRequest() {
    const req = this.request();
    if (!req?.id) return;

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/auth']);
      return;
    }

    this.isAccepting.set(true);
    this.error.set('');

    this.apiService.acceptRequest(req.id).subscribe({
      next: (updatedRequest) => {
        this.request.set(updatedRequest);
        this.successMessage.set('Task accepted successfully!');
        this.isAccepting.set(false);
      },
      error: (err) => {
        console.error('Error accepting request:', err);
        this.error.set('Failed to accept task. Please try again.');
        this.isAccepting.set(false);
      }
    });
  }

  isCompleting = signal(false);

  completeTask() {
    const req = this.request();
    if (!req?.id) return;

    this.isCompleting.set(true);
    this.error.set('');

    this.apiService.completeRequest(req.id).subscribe({
      next: (updatedRequest) => {
        this.request.set(updatedRequest);
        this.successMessage.set('Task marked as completed! 🎉');
        this.isCompleting.set(false);
      },
      error: (err) => {
        console.error('Error completing request:', err);
        this.error.set('Failed to complete task. Please try again.');
        this.isCompleting.set(false);
      }
    });
  }

  canAccept(): boolean {
    const req = this.request();
    const userId = this.authService.getCurrentUserId();

    // Can accept if: request is OPEN and current user is not the owner
    return req?.status === 'OPEN' && req?.userId !== userId;
  }

  // Check if current user is the helper (accepted the task)
  canComplete(): boolean {
    const req = this.request();
    // Can complete if: status is IN_PROGRESS and user is not the owner
    // Note: Ideally we'd check if user is the assigned helper, but for now we allow any non-owner
    const userId = this.authService.getCurrentUserId();
    return req?.status === 'IN_PROGRESS' && req?.userId !== userId;
  }

  isOwner(): boolean {
    const req = this.request();
    const userId = this.authService.getCurrentUserId();
    return req?.userId === userId;
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

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Not set';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return 'Not set';
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  }

  viewUserProfile(userId: number): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId && userId === currentUserId) {
      // Viewing own profile - go to full profile page with edit options
      this.router.navigate(['/profile']);
    } else {
      // Viewing another user's profile - go to public profile
      this.router.navigate(['/user'], { queryParams: { id: userId } });
    }
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }

  shareRequest(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.successMessage.set('Link copied to clipboard!');
      setTimeout(() => this.successMessage.set(''), 3000);
    });
  }
}
