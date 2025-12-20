import { Component, input, output, signal } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

@Component({
    selector: 'app-star-rating',
    standalone: true,
    imports: [NgFor, NgClass],
    template: `
    <div class="flex items-center gap-1">
      @for (star of stars; track star) {
        <button
          type="button"
          (click)="setRating(star)"
          (mouseenter)="hoverRating.set(star)"
          (mouseleave)="hoverRating.set(0)"
          class="text-2xl transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed"
          [disabled]="readonly()">
          <span [ngClass]="{
            'text-amber-400': star <= (hoverRating() || rating()),
            'text-slate-300 dark:text-dark-600': star > (hoverRating() || rating())
          }">★</span>
        </button>
      }
      @if (showValue()) {
        <span class="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {{ rating() > 0 ? rating().toFixed(1) : 'Rate' }}
        </span>
      }
    </div>
  `,
    styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class StarRatingComponent {
    rating = input<number>(0);
    readonly = input<boolean>(false);
    showValue = input<boolean>(true);

    ratingChange = output<number>();

    hoverRating = signal(0);
    stars = [1, 2, 3, 4, 5];

    setRating(value: number): void {
        if (!this.readonly()) {
            this.ratingChange.emit(value);
        }
    }
}
