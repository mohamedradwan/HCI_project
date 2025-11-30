import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ButtonComponent, NgFor, NgIf],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Using signals
  isLoggedIn = this.authService.isLoggedIn;

  categories = [
    { name: 'Transportation', color: 'bg-blue-100 text-blue-600', count: '230+ tasks', icon: '🚗' },
    { name: 'Home Repairs', color: 'bg-orange-100 text-orange-600', count: '180+ tasks', icon: '🔧' },
    { name: 'Tutoring', color: 'bg-teal-100 text-teal-600', count: '150+ tasks', icon: '🎓' },
    { name: 'Delivery', color: 'bg-amber-100 text-amber-600', count: '290+ tasks', icon: '📦' },
    { name: 'Cleaning', color: 'bg-indigo-100 text-indigo-600', count: '120+ tasks', icon: '🏠' },
    { name: 'Other Services', color: 'bg-purple-100 text-purple-600', count: '340+ tasks', icon: '⚡' }
  ];

  features = [
    { title: 'Trusted Community', description: 'Connect with verified local helpers in your neighborhood', icon: '👥' },
    { title: 'Safe & Secure', description: 'All users are verified with ratings and reviews', icon: '🛡️' },
    { title: 'Quick Response', description: 'Get help within minutes from nearby service providers', icon: '⏰' }
  ];

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
