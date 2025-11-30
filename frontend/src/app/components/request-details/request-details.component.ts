import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-nav-bar [currentScreen]="'home'" />
      <div class="max-w-6xl mx-auto px-4 py-8">
        <app-button variant="ghost" (clicked)="navigate('home')" className="mb-6">
          ← Back to Dashboard
        </app-button>
        <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h1 class="text-3xl font-bold text-slate-900 mb-4">Need help moving furniture</h1>
          <p class="text-slate-600 mb-6 leading-relaxed">
            I need help moving a couch, dining table, and several boxes from my apartment to a new place
            about 5 km away. The furniture needs to be handled carefully as it's valuable.
          </p>
          <div class="flex gap-3">
            <app-button className="rounded-xl">Accept Task</app-button>
            <app-button variant="outline" className="rounded-xl">Contact User</app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RequestDetailsComponent {
  private router = inject(Router);
  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
