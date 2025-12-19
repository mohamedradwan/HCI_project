// auth-screen.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule, NgIf],
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

  constructor() {
    this.authForm = this.fb.group({
      name: [''],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode(): void {
    this.isLogin.set(!this.isLogin());
    this.errorMessage.set('');

    if (!this.isLogin()) {
      this.authForm.get('name')?.setValidators([Validators.required]);
      this.authForm.get('phone')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('phone')?.clearValidators();
    }
    this.authForm.updateValueAndValidity();
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
          formValue.password
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
}
