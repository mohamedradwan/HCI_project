import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, BadgeComponent, AvatarComponent, NgFor],
  templateUrl: './home-dashboard.component.html'
})
export class HomeDashboardComponent {
  private router = inject(Router);

  selectedCategory = signal('all');

  stats = [
    { icon: '✅', label: 'Completed Tasks', value: '23', color: 'text-green-600 bg-green-100' },
    { icon: '📈', label: 'This Month', value: '8', color: 'text-blue-600 bg-blue-100' },
    { icon: '👥', label: 'Active Clients', value: '15', color: 'text-orange-600 bg-orange-100' },
    { icon: '⭐', label: 'Avg Rating', value: '4.8', color: 'text-amber-600 bg-amber-100' }
  ];

  nearbyRequests = [
    {
      id: 1, title: 'Need help moving furniture', category: 'Transportation',
      user: 'Sarah Ahmed', avatar: 'SA', rating: 4.8, distance: '1.2 km',
      budget: '$25', time: '2 hours ago', urgent: true
    },
    {
      id: 2, title: 'Fix leaking kitchen sink', category: 'Home Repairs',
      user: 'Mohammed Ali', avatar: 'MA', rating: 4.9, distance: '0.8 km',
      budget: '$40', time: '4 hours ago', urgent: false
    },
    {
      id: 3, title: 'Math tutoring for high school', category: 'Tutoring',
      user: 'Fatima Hassan', avatar: 'FH', rating: 5.0, distance: '2.5 km',
      budget: '$30/hr', time: '5 hours ago', urgent: false
    }
  ];

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
