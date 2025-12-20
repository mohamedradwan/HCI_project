// onboarding.component.ts
import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-onboarding',
    standalone: true,
    imports: [ButtonComponent],
    template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      
      <!-- Modal -->
      <div class="bg-white dark:bg-dark-900 rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-slideUp">
        
        <!-- Step Indicators -->
        <div class="flex justify-center gap-2 pt-6">
          @for (s of [1, 2, 3]; track s) {
            <div [class]="step() >= s ? 'bg-primary-500' : 'bg-slate-200 dark:bg-dark-700'"
                 class="w-2 h-2 rounded-full transition-colors"></div>
          }
        </div>

        <!-- Content -->
        <div class="p-8 text-center">
          
          <!-- Step 1: Welcome -->
          @if (step() === 1) {
            <div class="animate-fadeIn">
              <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <span class="text-4xl">👋</span>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Welcome to 5alasly!</h2>
              <p class="text-slate-500 dark:text-slate-400 mb-8">
                Your community marketplace for services and help. Connect with neighbors, get tasks done, and earn money!
              </p>
            </div>
          }

          <!-- Step 2: How It Works -->
          @if (step() === 2) {
            <div class="animate-fadeIn">
              <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span class="text-4xl">🎯</span>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">How It Works</h2>
              <div class="text-left space-y-4 mb-8">
                <div class="flex items-start gap-3">
                  <span class="text-2xl">📝</span>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">Post a Request</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Describe what you need help with</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-2xl">🤝</span>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">Get Help</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Neighbors accept and complete your task</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-2xl">⭐</span>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">Rate & Review</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Build trust in your community</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Ready -->
          @if (step() === 3) {
            <div class="animate-fadeIn">
              <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <span class="text-4xl">🚀</span>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">You're All Set!</h2>
              <p class="text-slate-500 dark:text-slate-400 mb-8">
                Start exploring requests in your area or post your first request to get help from your community.
              </p>
            </div>
          }

          <!-- Buttons -->
          <div class="flex gap-3 justify-center">
            @if (step() > 1) {
              <button (click)="prevStep()"
                class="px-6 py-3 rounded-xl border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-dark-800 transition-all">
                ← Back
              </button>
            }
            @if (step() < 3) {
              <button (click)="nextStep()"
                class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all hover:scale-105">
                Next →
              </button>
            } @else {
              <button (click)="finish()"
                class="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all hover:scale-105">
                🎉 Get Started
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class OnboardingComponent {
    @Output() completed = new EventEmitter<void>();
    step = signal(1);

    nextStep() {
        if (this.step() < 3) {
            this.step.update(s => s + 1);
        }
    }

    prevStep() {
        if (this.step() > 1) {
            this.step.update(s => s - 1);
        }
    }

    finish() {
        localStorage.setItem('5alasly-onboarded', 'true');
        this.completed.emit();
    }
}
