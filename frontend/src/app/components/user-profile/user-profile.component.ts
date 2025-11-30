import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NavBarComponent, AvatarComponent, BadgeComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-nav-bar [currentScreen]="'profile'" />
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="h-32 bg-gradient-to-br from-blue-500 to-orange-500"></div>
          <div class="px-8 pb-8">
            <div class="flex justify-between -mt-16 mb-4">
              <app-avatar fallback="AH" className="w-32 h-32 border-4 border-white shadow-lg" />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <h1 class="text-3xl font-bold text-slate-900">Ahmed Hassan</h1>
              <app-badge variant="secondary" className="gap-1">✓ Verified</app-badge>
            </div>
            <p class="text-slate-600 mb-4">⭐ 4.8 (23 reviews)</p>
            <p class="text-slate-600">
              Experienced helper with a passion for making a difference in my community.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {}
