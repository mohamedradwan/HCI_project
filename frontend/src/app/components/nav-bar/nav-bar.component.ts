import { Component, inject, model } from '@angular/core'; // Import model
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
// No need for NgIf or NgClass in imports with modern syntax

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [ButtonComponent], // Removed NgIf/NgClass imports
  template: `
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <div class="flex items-center gap-2 cursor-pointer" (click)="navigate('home')">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span class="text-white font-bold">5</span>
            </div>
            <span class="text-slate-900 text-xl font-medium hidden sm:block">5alasly</span>
          </div>

          <div class="hidden md:flex items-center gap-2">
            <app-button
              [variant]="currentScreen() === 'home' ? 'secondary' : 'ghost'"
              (clicked)="navigate('home')">🏠 Dashboard
            </app-button>
            <app-button
              [variant]="currentScreen() === 'create' ? 'secondary' : 'ghost'"
              (clicked)="navigate('create')">➕ Post Request
            </app-button>
          </div>

          <div class="flex items-center gap-3 relative">
            <app-button variant="ghost" size="icon" (clicked)="showMenu = !showMenu">
              <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">👤</span>
              </div>
            </app-button>

            @if (showMenu) {
              <div class="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <button (click)="navigate('profile'); showMenu=false" class="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2">
                  👤 View Profile
                </button>
                <div class="border-t border-slate-200 my-1"></div>
                <button (click)="logout()" class="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-red-600">
                  🚪 Logout
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavBarComponent {
  // MODERN ANGULAR: Use 'model' for inputs you want to be able to update from inside
  currentScreen = model<string>('');

  showMenu = false;
  private router = inject(Router);
  private authService = inject(AuthService);

  navigate(screen: string) {
    // This updates the local signal AND notifies the parent (two-way binding)
    this.currentScreen.set(screen);
    this.router.navigate([`/${screen}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
