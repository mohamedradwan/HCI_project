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
    if (!this.isLogin()) {
      this.authForm.get('name')?.setValidators([Validators.required]);
      this.authForm.get('phone')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('phone')?.clearValidators();
    }
    this.authForm.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      this.authService.login();
      this.router.navigate(['/home']);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }
}
