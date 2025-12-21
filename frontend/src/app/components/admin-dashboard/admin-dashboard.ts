import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, ServiceOfferingDTO, ProviderStatsDTO } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-dark-900 pt-8 pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p class="text-slate-600 dark:text-slate-400">Manage your service offerings and track your performance.</p>
          </div>
          <app-button variant="outline" size="sm" (clicked)="navigateHome()">
            🏠 Return Home
          </app-button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl">
                💼
              </div>
              <span class="text-slate-500 dark:text-slate-400 font-medium">Active Services</span>
            </div>
            <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats()?.activeServices || 0 }}</div>
            <div class="mt-2 text-sm text-green-600 font-medium">↑ 12% from last month</div>
          </div>

          <div class="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center text-2xl">
                💰
              </div>
              <span class="text-slate-500 dark:text-slate-400 font-medium">Total Earnings</span>
            </div>
            <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEarnings() }}</div>
            <div class="mt-2 text-sm text-green-600 font-medium">↑ $1,450 this month</div>
          </div>

          <div class="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center text-2xl">
                ⭐
              </div>
              <span class="text-slate-500 dark:text-slate-400 font-medium">Avg Rating</span>
            </div>
            <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatRating() }}</div>
            <div class="mt-2 text-sm text-slate-500">Based on {{ stats()?.totalReviews || 0 }} reviews</div>
          </div>

          <div class="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
              <span class="text-slate-500 dark:text-slate-400 font-medium">Tasks (Month)</span>
            </div>
            <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats()?.completedTasksMonth || 0 }}</div>
            <div class="mt-2 text-sm text-blue-600 font-medium">4 in progress</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <!-- Earnings Chart -->
          <div class="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Earnings History</h3>
            <div class="flex items-end justify-between h-48 px-2">
              <div *ngFor="let item of earningsHistory()" class="flex flex-col items-center gap-2 group h-full">
                <div class="relative w-8 bg-slate-100 dark:bg-dark-700/30 rounded-lg flex flex-col justify-end h-full overflow-hidden">
                  <div class="bg-primary-500 rounded-t-lg transition-all duration-500 group-hover:bg-primary-400 w-full" 
                    [style.height]="getChartHeight(item.value, maxEarnings()) + '%'">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      \${{ item.value }}
                    </div>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ item.key }}</span>
              </div>
            </div>
          </div>

          <!-- Category Distribution -->
          <div class="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Category Distribution</h3>
            <div class="space-y-4">
              <div *ngFor="let cat of categoryStats(); let i = index" class="space-y-1.5">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-700 dark:text-slate-300">{{ cat.key }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ cat.value }} services</span>
                </div>
                <div class="h-2 bg-slate-100 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-1000 bg-primary-500"
                    [style.opacity]="1 - (i * 0.15)"
                    [style.width.%]="(cat.value / (stats()?.activeServices || 1)) * 100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Services List -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-dark-700 flex justify-between items-center">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Your Service Offerings</h2>
            <app-button variant="default" size="sm" (clicked)="createNew()">Create New</app-button>
          </div>
          
          <div class="divide-y divide-slate-200 dark:divide-dark-700">
            @for (offering of offerings(); track offering.id) {
              <div class="group">
                <div class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors cursor-pointer"
                     (click)="toggleExpand(offering.id)">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                      <h3 class="font-semibold text-slate-900 dark:text-white">{{ offering.title }}</h3>
                      @if (expandedId() === offering.id) {
                        <span class="text-xs text-slate-400">🔼</span>
                      } @else {
                        <span class="text-xs text-slate-400">🔽</span>
                      }
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                        {{ offering.category }}
                      </span>
                      <span>{{ offering.price }}</span>
                      <span>•</span>
                      <span>{{ offering.active ? 'Active' : 'Inactive' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <app-button variant="ghost" size="icon" (clicked)="$event.stopPropagation(); deleteOffering(offering.id)">
                      🗑️
                    </app-button>
                  </div>
                </div>
                
                <!-- Expandable Details -->
                @if (expandedId() === offering.id) {
                  <div class="px-6 pb-6 pt-3 bg-slate-50/50 dark:bg-dark-800/50 border-t border-slate-100 dark:border-dark-700">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="md:col-span-2">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                        <p class="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                          {{ offering.description }}
                        </p>
                      </div>
                      <div class="space-y-4">
                        <div>
                          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Details</h4>
                          <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                              <span class="text-slate-500">Price</span>
                              <span class="font-semibold text-slate-900 dark:text-white">{{ offering.price }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-slate-500">Created</span>
                              <span class="text-slate-700 dark:text-slate-300">{{ offering.createdAt | date:'mediumDate' }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-slate-500">Status</span>
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                [ngClass]="offering.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'">
                                {{ offering.active ? 'Live' : 'Hidden' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="pt-2">
                          <app-button variant="outline" size="sm" className="w-full">Edit Service</app-button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <div class="px-6 py-12 text-center">
                <div class="text-4xl mb-4">📭</div>
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No service offerings yet</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Start offering your services to reach more clients!</p>
              </div>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-dark-700">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-dark-700/50">
                  <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Activity</th>
                  <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-dark-700">
                <tr *ngFor="let act of recentActivity()" class="hover:bg-slate-50 dark:hover:bg-dark-700/30 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900 dark:text-white">{{ act.event }}</div>
                    <div class="text-xs text-slate-500">{{ act.client }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-green-100 text-green-700': act.status === 'Completed',
                        'bg-blue-100 text-blue-700': act.status === 'In Progress',
                        'bg-yellow-100 text-yellow-700': act.status === 'Pending'
                      }">
                      {{ act.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ act.price }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ act.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  offerings = signal<ServiceOfferingDTO[]>([]);
  stats = signal<ProviderStatsDTO | null>(null);
  expandedId = signal<number | null>(null);

  recentActivity = signal([
    { event: 'Math Tutoring Session', client: 'Ahmed Ali', status: 'Completed', price: '$45.00', date: 'Dec 18, 2025' },
    { event: 'Physics Exam Prep', client: 'Sara Hassan', status: 'In Progress', price: '$60.00', date: 'Dec 20, 2025' },
    { event: 'Algebra Basics', client: 'Mohamed Omar', status: 'Pending', price: '$35.00', date: 'Dec 21, 2025' },
    { event: 'Home Plumbing Fix', client: 'John Doe', status: 'Completed', price: '$120.00', date: 'Dec 15, 2025' }
  ]);

  earningsHistory = computed(() => {
    const history = this.stats()?.earningsHistory || {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.entries(history)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => months.indexOf(a.key) - months.indexOf(b.key));
  });

  categoryStats = computed(() => {
    const stats = this.stats()?.categoryStats || {};
    return Object.entries(stats).map(([key, value]) => ({ key, value }));
  });

  maxEarnings = computed(() => {
    const values = this.earningsHistory().map(h => h.value);
    return values.length ? Math.max(...values) : 1000;
  });

  getChartHeight(value: number, max: number) {
    return (value / max) * 100;
  }

  formatEarnings() {
    return '$' + (this.stats()?.totalEarnings?.toLocaleString() || '0.00');
  }

  formatRating() {
    return this.stats()?.avgRating?.toFixed(1) || '0.0';
  }

  ngOnInit() {
    this.reloadData();
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  navigateHome() {
    this.router.navigate(['/home']);
  }

  createNew() {
    this.router.navigate(['/create']);
  }

  reloadData() {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.apiService.getOfferingsByUser(userId).subscribe(data => {
        this.offerings.set(data);
      });
      this.apiService.getProviderStats(userId).subscribe(data => {
        this.stats.set(data);
      });
    }
  }

  deleteOffering(id: number) {
    const userId = this.authService.getCurrentUserId();
    if (userId && confirm('Are you sure you want to delete this service offering?')) {
      this.apiService.deleteOffering(id, userId).subscribe(() => this.reloadData());
    }
  }
}
