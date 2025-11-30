import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [ngClass]="buttonClasses()"
      (click)="clicked.emit($event)">
      <ng-content />
    </button>
  `
})
export class ButtonComponent {
  // Angular 20 signals-based inputs
  variant = input<'default' | 'outline' | 'ghost' | 'secondary'>('default');
  size = input<'sm' | 'md' | 'lg' | 'icon'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  className = input('');

  // Angular 20 output with new syntax
  clicked = output<Event>();

  buttonClasses() {
    const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border-2 border-slate-300 bg-transparent hover:bg-slate-50',
      ghost: 'bg-transparent hover:bg-slate-100',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2'
    };
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${this.className()}`;
  }
}
