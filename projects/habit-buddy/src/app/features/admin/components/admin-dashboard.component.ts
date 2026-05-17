import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Users, CheckCircle, Activity, UserPlus, Clock } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

interface AdminStats {
  total_users: number;
  new_users_7d: number;
  total_habits: number;
  total_checkins: number;
  recent_users: Array<{
    id: string;
    email: string;
    display_name: string;
    created_at: number;
  }>;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="dashboard-container p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p class="text-slate-600">Platform insights and overview</p>
      </div>

      <div *ngIf="isLoading()" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="error()" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
        {{ error() }}
      </div>

      <div *ngIf="!isLoading() && stats()" class="grid gap-6">
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div class="bg-blue-100 p-4 rounded-lg mr-4">
              <lucide-icon [img]="UsersIcon" class="text-blue-600"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Total Users</p>
              <h3 class="text-2xl font-bold text-slate-800">{{ stats()?.total_users }}</h3>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div class="bg-green-100 p-4 rounded-lg mr-4">
              <lucide-icon [img]="UserPlusIcon" class="text-green-600"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">New Users (7d)</p>
              <h3 class="text-2xl font-bold text-slate-800">{{ stats()?.new_users_7d }}</h3>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div class="bg-purple-100 p-4 rounded-lg mr-4">
              <lucide-icon [img]="ActivityIcon" class="text-purple-600"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Active Habits</p>
              <h3 class="text-2xl font-bold text-slate-800">{{ stats()?.total_habits }}</h3>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div class="bg-orange-100 p-4 rounded-lg mr-4">
              <lucide-icon [img]="CheckCircleIcon" class="text-orange-600"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Total Check-ins</p>
              <h3 class="text-2xl font-bold text-slate-800">{{ stats()?.total_checkins }}</h3>
            </div>
          </div>
        </div>

        <!-- Recent Users Table -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 class="text-lg font-semibold text-slate-800">Recent Registrations</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th class="px-6 py-3">Name</th>
                  <th class="px-6 py-3">Email</th>
                  <th class="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr *ngFor="let user of stats()?.recent_users" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 text-slate-800 font-medium">{{ user.display_name || 'N/A' }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-slate-500 text-sm flex items-center">
                    <lucide-icon [img]="ClockIcon" size="14" class="mr-1"></lucide-icon>
                    {{ user.created_at | date:'mediumDate' }}
                  </td>
                </tr>
                <tr *ngIf="stats()?.recent_users?.length === 0">
                  <td colspan="3" class="px-6 py-8 text-center text-slate-500">No users found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 64px);
      background-color: #f8fafc;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  
  stats = signal<AdminStats | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  
  UsersIcon = Users;
  UserPlusIcon = UserPlus;
  ActivityIcon = Activity;
  CheckCircleIcon = CheckCircle;
  ClockIcon = Clock;

  async ngOnInit() {
    try {
      this.isLoading.set(true);
      this.error.set('');
      const data = await firstValueFrom(
        this.http.get<AdminStats>(`${environment.apiUrl}/api/admin/dashboard`)
      );
      this.stats.set(data);
    } catch (err: any) {
      console.error('Failed to load admin stats', err);
      this.error.set(err.error?.detail || 'Failed to load dashboard statistics');
    } finally {
      this.isLoading.set(false);
    }
  }
}
