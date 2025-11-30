import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type Screen = 'landing' | 'auth' | 'home' | 'create' | 'details' | 'profile' | 'chat' | 'admin';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);

  navigate(screen: Screen): void {
    const routes: Record<Screen, string> = {
      landing: '/',
      auth: '/auth',
      home: '/home',
      create: '/create',
      details: '/details',
      profile: '/profile',
      chat: '/chat',
      admin: '/admin'
    };
    this.router.navigate([routes[screen]]);
  }
}
