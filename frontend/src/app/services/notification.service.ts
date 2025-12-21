import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api';
import { interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedRequestId?: number;
  relatedUserId?: number;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiService = inject(ApiService);
  
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Poll for notifications every 30 seconds
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.apiService.getUnreadCount())
      )
      .subscribe({
        next: (response) => {
          this.unreadCount.set(response.count);
        },
        error: (err) => console.error('Error fetching unread count:', err)
      });
  }

  loadNotifications(): void {
    this.apiService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        const unread = notifications.filter(n => !n.isRead).length;
        this.unreadCount.set(unread);
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  markAsRead(notificationId: number): void {
    this.apiService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const current = this.notifications();
        const updated = current.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        this.notifications.set(updated);
        this.unreadCount.update(count => Math.max(0, count - 1));
      },
      error: (err) => console.error('Error marking notification as read:', err)
    });
  }

  markAllAsRead(): void {
    this.apiService.markAllNotificationsAsRead().subscribe({
      next: () => {
        const current = this.notifications();
        const updated = current.map(n => ({ ...n, isRead: true }));
        this.notifications.set(updated);
        this.unreadCount.set(0);
      },
      error: (err) => console.error('Error marking all as read:', err)
    });
  }

  deleteNotification(notificationId: number): void {
    this.apiService.deleteNotification(notificationId).subscribe({
      next: () => {
        const current = this.notifications();
        const notification = current.find(n => n.id === notificationId);
        const updated = current.filter(n => n.id !== notificationId);
        this.notifications.set(updated);
        
        if (notification && !notification.isRead) {
          this.unreadCount.update(count => Math.max(0, count - 1));
        }
      },
      error: (err) => console.error('Error deleting notification:', err)
    });
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'REQUEST_ACCEPTED':
        return '✅';
      case 'REQUEST_COMPLETED':
        return '🎉';
      case 'REQUEST_CANCELLED':
        return '❌';
      case 'REVIEW_RECEIVED':
        return '⭐';
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_SENT':
        return '💰';
      default:
        return '🔔';
    }
  }
}
