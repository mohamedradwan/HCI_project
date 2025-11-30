import { Component, input, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div [ngClass]="'relative inline-block ' + className()">
      @if (src() && !error()) {
        <img
          [src]="src()"
          [alt]="alt()"
          (error)="error.set(true)"
          class="w-full h-full rounded-full object-cover" />
      } @else {
        <div [ngClass]="'w-full h-full rounded-full flex items-center justify-center text-white font-medium ' + fallbackClass()">
          {{ fallback() }}
        </div>
      }
    </div>
  `
})
export class AvatarComponent {
  src = input('');
  alt = input('');
  fallback = input('');
  className = input('w-10 h-10');
  fallbackClass = input('bg-gradient-to-br from-blue-500 to-orange-500');
  error = signal(false);
}
