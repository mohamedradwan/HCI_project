// create-request.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, ReactiveFormsModule, NgFor, NgIf, NgClass],
  templateUrl: './create-request.component.html'
})
export class CreateRequestComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  currentStep = signal(1);
  requestForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Details' },
    { number: 3, title: 'Location & Time' },
    { number: 4, title: 'Review' }
  ];

  categories = ['Transportation', 'Home Repairs', 'Tutoring', 'Delivery', 'Cleaning', 'Other Services'];

  progressWidth = computed(() => ((this.currentStep() - 1) / (this.steps.length - 1)) * 100);

  constructor() {
    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      budget: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      urgent: [false]
    });
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      // Validate current step fields
      if (!this.validateCurrentStep()) {
        return;
      }
      this.currentStep.update(v => v + 1);
    } else {
      // Submit the form
      this.submitRequest();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
      this.errorMessage.set('');
    }
  }

  validateCurrentStep(): boolean {
    const step = this.currentStep();
    let fieldsToValidate: string[] = [];

    switch(step) {
      case 1:
        fieldsToValidate = ['title', 'category'];
        break;
      case 2:
        fieldsToValidate = ['description', 'budget'];
        break;
      case 3:
        fieldsToValidate = ['location', 'date', 'time'];
        break;
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const control = this.requestForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      this.errorMessage.set('Please fill in all required fields');
    } else {
      this.errorMessage.set('');
    }

    return isValid;
  }

  submitRequest(): void {
    if (!this.requestForm.valid) {
      this.errorMessage.set('Please complete all fields');
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.errorMessage.set('Please log in to create a request');
      this.router.navigate(['/auth']);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.requestForm.value;

    this.apiService.createRequest({
      title: formValue.title,
      category: formValue.category,
      description: formValue.description,
      budget: formValue.budget,
      location: formValue.location,
      date: formValue.date,
      time: formValue.time,
      urgent: formValue.urgent
    }).subscribe({
      next: (response) => {
        console.log('Request created:', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error creating request:', error);
        this.errorMessage.set('Failed to create request. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
