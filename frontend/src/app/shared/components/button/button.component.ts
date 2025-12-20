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
  variant = input<'default' | 'outline' | 'ghost' | 'secondary' | 'danger'>('default');
  size = input<'sm' | 'md' | 'lg' | 'icon'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  className = input('');

  clicked = output<Event>();

  buttonClasses() {
    const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-900';

    const variants = {
      default: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:ring-primary-500 hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border-2 border-slate-300 dark:border-dark-600 bg-transparent hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
      secondary: 'bg-slate-100 dark:bg-dark-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-dark-600 focus:ring-slate-400',
      danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25 focus:ring-red-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2.5'
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${this.className()}`;
  }
}
