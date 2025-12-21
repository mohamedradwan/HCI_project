import { Component, inject, model, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NotificationCenterComponent } from '../notification-center/notification-center';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [ButtonComponent, NotificationCenterComponent],
  template: `
    <nav class="sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300
                bg-white/80 border-slate-200/50 dark:bg-dark-900/80 dark:border-dark-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Hamburger Menu Button (Mobile) -->
          <button (click)="mobileMenuOpen = !mobileMenuOpen" 
            class="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors">
            @if (!mobileMenuOpen) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
          </button>

          <!-- Logo -->
          <div class="flex items-center gap-3 cursor-pointer group" (click)="navigate('home')">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all group-hover:scale-105">
              <span class="text-white font-bold text-lg">5</span>
            </div>
            <span class="text-slate-900 dark:text-white text-xl font-semibold hidden sm:block">5alasly</span>
          </div>

          <!-- Nav Links (Desktop) -->
          <div class="hidden md:flex items-center gap-2">
            <app-button
              [variant]="currentScreen() === 'home' ? 'secondary' : 'ghost'"
              (clicked)="navigate('home')">
              <span class="mr-2">🏠</span> Home
            </app-button>
            <app-button
              [variant]="currentScreen() === 'create' ? 'secondary' : 'ghost'"
              (clicked)="navigate('create')">
              <span class="mr-2">➕</span> Create
            </app-button>
          </div>

          <!-- Right Section -->
          <div class="flex items-center gap-2 relative">
            <!-- Theme Toggle -->
            <button
              (click)="toggleTheme()"
              class="p-2.5 rounded-xl transition-all duration-300 hover:scale-105
                     bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300
                     hover:bg-slate-200 dark:hover:bg-dark-600">
              @if (themeService.isDarkMode()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>

            <!-- Notification Bell -->
            <app-notification-center></app-notification-center>

            <!-- Profile Menu -->
            <app-button variant="ghost" size="icon" (clicked)="showMenu = !showMenu">
              @if (userAvatarUrl()) {
                <img [src]="userAvatarUrl()" class="w-9 h-9 rounded-full object-cover shadow-md" alt="Avatar" />
              } @else {
                <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-md">
                  <span class="text-white text-sm font-medium">{{ userInitials() }}</span>
                </div>
              }
            </app-button>

            @if (showMenu) {
              <div class="absolute right-0 top-14 w-56 rounded-2xl shadow-2xl border py-2 z-50 overflow-hidden
                          bg-white dark:bg-dark-800 border-slate-200 dark:border-dark-700 animate-fadeIn">
                <button (click)="navigate('profile'); showMenu=false" 
                  class="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                         hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200">
                  <span class="text-lg">👤</span>
                  <span class="font-medium">View Profile</span>
                </button>
                <button (click)="navigate('admin-dashboard'); showMenu=false" 
                  class="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                         hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200">
                  <span class="text-lg">🛠️</span>
                  <span class="font-medium">Admin Dashboard</span>
                </button>
                <button (click)="navigate('settings'); showMenu=false" 
                  class="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                         hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200">
                  <span class="text-lg">⚙️</span>
                  <span class="font-medium">Settings</span>
                </button>
                <div class="border-t mx-3 my-1 border-slate-200 dark:border-dark-600"></div>
                <button (click)="logout()" 
                  class="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                         hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
                  <span class="text-lg">🚪</span>
                  <span class="font-medium">Logout</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    @if (mobileMenuOpen) {
      <div class="fixed inset-0 z-40 md:hidden">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="mobileMenuOpen = false"></div>
        
        <!-- Slide-out Menu -->
        <div class="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-dark-900 shadow-2xl animate-slideIn">
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-8">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-xl">5</span>
              </div>
              <span class="text-slate-900 dark:text-white text-2xl font-semibold">5alasly</span>
            </div>

            <!-- Navigation Links -->
            <nav class="space-y-2">
                <button (click)="navigate('home'); mobileMenuOpen=false"
                class="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-colors
                       hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200">
                <span class="text-xl">🏠</span>
                <span class="font-medium">Home</span>
              </button>
              <button (click)="navigate('create'); mobileMenuOpen=false"
                class="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-colors
                       hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200">
                <span class="text-xl">➕</span>
                <span class="font-medium">Create</span>
              </button>
              <button (click)="navigate('profile'); mobileMenuOpen=false"
                class="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-colors
                       hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200">
                <span class="text-xl">👤</span>
                <span class="font-medium">My Profile</span>
              </button>
              <button (click)="navigate('settings'); mobileMenuOpen=false"
                class="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-colors
                       hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200">
                <span class="text-xl">⚙️</span>
                <span class="font-medium">Settings</span>
              </button>
              <button (click)="navigate('admin-dashboard'); mobileMenuOpen=false"
                class="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-colors
                       hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200">
                <span class="text-xl">🛠️</span>
                <span class="font-medium">Admin Dashboard</span>
              </button>
            </nav>

            <!-- Logout at bottom -->
            <div class="absolute bottom-6 left-6 right-6">
              <button (click)="logout(); mobileMenuOpen=false"
                class="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-colors
                       bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">
                <span class="text-xl">🚪</span>
                <span class="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class NavBarComponent implements OnInit {
  currentScreen = model<string>('');
  showMenu = false;
  mobileMenuOpen = false;
  userAvatarUrl = signal<string | null>(null);
  userInitials = signal('👤');

  private router = inject(Router);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  themeService = inject(ThemeService);

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.apiService.getUserById(userId).subscribe({
        next: (user: any) => {
          if (user.avatarUrl) {
            this.userAvatarUrl.set(user.avatarUrl);
          }
          if (user.name) {
            const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
            this.userInitials.set(initials);
          }
        },
        error: () => { }
      });
    }
  }

  navigate(screen: string) {
    this.currentScreen.set(screen);
    this.router.navigate([`/${screen}`]);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
