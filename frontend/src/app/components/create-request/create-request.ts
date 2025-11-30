import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, ReactiveFormsModule, NgFor, NgIf, NgClass],
  templateUrl: './create-request.component.html'
})
export class CreateRequestComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentStep = signal(1);
  requestForm: FormGroup;

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
      time: ['', Validators.required]
    });
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(v => v + 1);
    } else {
      this.router.navigate(['/home']);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(v => v - 1);
    }
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
