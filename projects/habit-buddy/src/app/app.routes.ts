import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'marketing',
    loadComponent: () => import('./components/marketing-landing.component').then(m => m.MarketingLandingComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'goals',
    loadComponent: () => import('./features/goals/components/goals/goals.component').then(m => m.GoalsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/components/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    loadComponent: () => import('./features/statistics/components/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reminders',
    loadComponent: () => import('./features/reminders/components/reminders/reminders.component').then(m => m.RemindersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
