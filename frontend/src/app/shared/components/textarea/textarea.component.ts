import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <textarea
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [(ngModel)]="value"
      [ngClass]="textareaClasses()"
      [rows]="rows()">
    </textarea>
  `
})
export class TextareaComponent {
  placeholder = input('');
  disabled = input(false);
  className = input('');
  rows = input(3);
  value = model('');

  textareaClasses() {
    return `w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${this.className()}`;
  }
}
