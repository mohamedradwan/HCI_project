import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.html',
  styleUrls: ['./notification-center.css']
})
export class NotificationCenterComponent implements OnInit {
  private router = inject(Router);
  notificationService = inject(NotificationService);
  
  isOpen = signal(false);

  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.notificationService.loadNotifications();
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }

    // Navigate to related page
    if (notification.relatedRequestId) {
      this.router.navigate(['/details'], { queryParams: { id: notification.relatedRequestId } });
      this.close();
    } else if (notification.relatedUserId) {
      this.router.navigate(['/user'], { queryParams: { id: notification.relatedUserId } });
      this.close();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id);
  }

  getIcon(type: string): string {
    return this.notificationService.getIconForType(type);
  }
}
