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

  canAccept(): boolean {
    const req = this.request();
    const userId = this.authService.getCurrentUserId();

    // Can accept if: request is OPEN and current user is not the owner
    return req?.status === 'OPEN' && req?.userId !== userId;
  }

  isOwner(): boolean {
    const req = this.request();
    const userId = this.authService.getCurrentUserId();
    return req?.userId === userId;
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

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
