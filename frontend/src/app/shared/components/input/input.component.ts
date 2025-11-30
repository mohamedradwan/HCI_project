import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <input
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [(ngModel)]="value"
      [ngClass]="inputClasses()"
    />
  `
})
export class InputComponent {
  type = input('text');
  placeholder = input('');
  disabled = input(false);
  className = input('');

  // Angular 20 two-way binding with model signal
  value = model('');

  inputClasses() {
    return `w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${this.className()}`;
  }
}
