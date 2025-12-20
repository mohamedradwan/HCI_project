// auth-screen.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './auth-screen.component.html'
})
export class AuthScreenComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLogin = signal(true);
  authForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  // Address signals
  selectedAddress = signal<string | null>(null);
  selectedLatitude = signal<number | null>(null);
  selectedLongitude = signal<number | null>(null);
  showMapModal = signal(false);

  constructor() {
    // Login mode starts with minimal validation
    this.authForm = this.fb.group({
      name: [''],
      phone: [''],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      paypalEmail: ['']
    });
  }

  toggleMode(): void {
    this.isLogin.set(!this.isLogin());
    this.errorMessage.set('');

    if (!this.isLogin()) {
      // Signup mode - add all validators
      this.authForm.get('name')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
      this.authForm.get('phone')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]);
      this.authForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.authForm.get('password')?.setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]);
    } else {
      // Login mode - minimal validators (just required)
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('phone')?.clearValidators();
      this.authForm.get('email')?.setValidators([Validators.required]);
      this.authForm.get('password')?.setValidators([Validators.required]);
    }
    this.authForm.get('name')?.updateValueAndValidity();
    this.authForm.get('phone')?.updateValueAndValidity();
    this.authForm.get('email')?.updateValueAndValidity();
    this.authForm.get('password')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (!this.authForm.valid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.authForm.value;

      if (this.isLogin()) {
        // Login
        await this.authService.loginWithCredentials(
          formValue.email,
          formValue.password
        );
      } else {
        // Register
        await this.authService.register(
          formValue.name,
          formValue.email,
          formValue.phone,
          formValue.password,
          formValue.paypalEmail || undefined,
          this.selectedLatitude() || undefined,
          this.selectedLongitude() || undefined,
          this.selectedAddress() || undefined
        );
      }

      // Navigate to home on success
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error('Auth error:', error);
      this.errorMessage.set(
        error.error?.message ||
        error.message ||
        'An error occurred. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  getPasswordStrength(): { level: number; label: string; color: string } {
    const password = this.authForm.get('password')?.value || '';

    if (!password) {
      return { level: 0, label: '', color: '' };
    }

    let score = 0;

    // Length checks
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Map score to levels
    if (score <= 2) {
      return { level: 1, label: 'Weak', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    } else if (score <= 5) {
      return { level: 3, label: 'Good', color: 'bg-blue-500' };
    } else {
      return { level: 4, label: 'Strong', color: 'bg-green-500' };
    }
  }

  // Opens a simple address input method using browser geolocation
  openAddressModal(): void {
    // Use browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.selectedLatitude.set(position.coords.latitude);
          this.selectedLongitude.set(position.coords.longitude);
          // Reverse geocode to get address (simplified - just show coordinates for now)
          this.selectedAddress.set(`Near ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback: let user type address manually
          const address = prompt('Enter your address (we couldn\'t detect your location):');
          if (address) {
            this.selectedAddress.set(address);
            // Use Cairo center as default coordinates for Egypt
            this.selectedLatitude.set(30.0444);
            this.selectedLongitude.set(31.2357);
          }
        }
      );
    } else {
      // Fallback for browsers without geolocation
      const address = prompt('Enter your address:');
      if (address) {
        this.selectedAddress.set(address);
        this.selectedLatitude.set(30.0444);
        this.selectedLongitude.set(31.2357);
      }
    }
  }
}
