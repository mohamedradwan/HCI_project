// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { ApiService, AuthResponse } from './api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal(false);
  currentUser = signal<AuthResponse | null>(null);

  constructor(private apiService: ApiService) {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      this.isLoggedIn.set(true);
      this.currentUser.set(JSON.parse(userStr));
    }
  }

  register(name: string, email: string, phone: string, password: string, paypalEmail?: string, latitude?: number, longitude?: number, address?: string) {
    return new Promise<AuthResponse>((resolve, reject) => {
      this.apiService.register({ name, email, phone, password, paypalEmail, latitude, longitude, address }).subscribe({
        next: (response) => {
          if (response.userId) {
            this.handleAuthSuccess(response);
            resolve(response);
          } else {
            reject(new Error(response.message || 'Registration failed'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  loginWithCredentials(email: string, password: string) {
    return new Promise<AuthResponse>((resolve, reject) => {
      this.apiService.login({ email, password }).subscribe({
        next: (response) => {
          if (response.userId) {
            this.handleAuthSuccess(response);
            resolve(response);
          } else {
            reject(new Error(response.message || 'Login failed'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // Keep the old login() method for compatibility
  login() {
    this.isLoggedIn.set(true);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUser');
  }

  private handleAuthSuccess(response: AuthResponse) {
    this.isLoggedIn.set(true);
    this.currentUser.set(response);
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('currentUser', JSON.stringify(response));
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  }
}
