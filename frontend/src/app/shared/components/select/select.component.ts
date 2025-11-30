import { Component, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <select
      [(ngModel)]="value"
      [disabled]="disabled()"
      [ngClass]="selectClasses()">
      <option value="" disabled>{{ placeholder() }}</option>
      <ng-content />
    </select>
  `
})
export class SelectComponent {
  placeholder = input('Select an option');
  disabled = input(false);
  className = input('');
  value = model('');

  selectClasses() {
    return `w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${this.className()}`;
  }
}
