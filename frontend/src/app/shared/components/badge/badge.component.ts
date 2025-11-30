import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span [ngClass]="badgeClasses()"><ng-content /></span>`
})
export class BadgeComponent {
  variant = input<'default' | 'secondary' | 'outline'>('default');
  className = input('');

  badgeClasses() {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium';
    const variants = {
      default: 'bg-blue-600 text-white',
      secondary: 'bg-slate-100 text-slate-900',
      outline: 'border border-slate-300 bg-transparent'
    };
    return `${base} ${variants[this.variant()]} ${this.className()}`;
  }
}
