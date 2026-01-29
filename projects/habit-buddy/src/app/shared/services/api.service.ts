import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Habit,
  Reminder
} from '../models/habit.model';
import { AuthService } from './auth.service';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  // API base URL - now uses environment variable
  private readonly API_BASE_URL = environment.apiUrl;

  constructor() {}

  // Habit CRUD operations
  getHabits(): Observable<Habit[]> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access habits');
    }
    
    return this.http.get<Habit[]>(`${this.API_BASE_URL}/api/habits`).pipe(
      catchError(this.handleError)
    );
  }

  getHabit(id: string): Observable<Habit> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access habits');
    }
    
    return this.http.get<Habit>(`${this.API_BASE_URL}/api/habits/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createHabit(habit: Partial<Habit>): Observable<Habit> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to create habits');
    }
    
    return this.http.post<Habit>(`${this.API_BASE_URL}/api/habits`, habit).pipe(
      catchError(this.handleError)
    );
  }

  updateHabit(id: string, habit: Partial<Habit>): Observable<Habit> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to update habits');
    }
    
    return this.http.put<Habit>(`${this.API_BASE_URL}/api/habits/${id}`, habit).pipe(
      catchError(this.handleError)
    );
  }

  deleteHabit(id: string): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to delete habits');
    }
    
    return this.http.delete<void>(`${this.API_BASE_URL}/api/habits/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Check-in operations
  checkInHabit(habitId: string, date?: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to check in habits');
    }
    
    
    const now = new Date();
    let checkInDate = now.getTime(); // Default to now in ms
    
    if (date) {
      // Parse YYYY-MM-DD string to timestamp
      // Create date at noon to avoid timezone issues with day boundaries
      checkInDate = new Date(date + 'T12:00:00').getTime();
    }

    const body = { 
      habit_id: habitId,
      check_in_date: checkInDate,
      status: 'completed'
    };
    
    return this.http.post(`${this.API_BASE_URL}/api/habits/${habitId}/check-in`, body).pipe(
      catchError(this.handleError)
    );
  }

  deleteCheckIn(habitId: string, checkInId: string): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to delete check-ins');
    }
    
    return this.http.delete<void>(`${this.API_BASE_URL}/api/habits/${habitId}/check-in/${checkInId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Statistics operations
  getOverviewStats(): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access statistics');
    }
    
    return this.http.get(`${this.API_BASE_URL}/api/stats/overview`).pipe(
      catchError(this.handleError)
    );
  }

  getHabitStats(habitId: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access statistics');
    }
    
    return this.http.get(`${this.API_BASE_URL}/api/stats/habit/${habitId}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllHabitsStats(): Observable<any[]> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access statistics');
    }
    
    return this.http.get<any[]>(`${this.API_BASE_URL}/api/stats/habits`).pipe(
      catchError(this.handleError)
    );
  }

  // Reminder operations
  getReminders(): Observable<any[]> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access reminders');
    }
    
    return this.http.get<any[]>(`${this.API_BASE_URL}/api/reminders`).pipe(
      catchError(this.handleError)
    );
  }

  getHabitReminder(habitId: string): Observable<Reminder> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to access reminders');
    }
    
    return this.http.get<Reminder>(`${this.API_BASE_URL}/api/reminders/${habitId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateHabitReminder(habitId: string, reminder: Reminder): Observable<Reminder> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to update reminders');
    }
    
    return this.http.put<Reminder>(`${this.API_BASE_URL}/api/reminders/${habitId}`, reminder).pipe(
      catchError(this.handleError)
    );
  }

  deleteHabitReminder(habitId: string): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to delete reminders');
    }
    
    return this.http.delete<void>(`${this.API_BASE_URL}/api/reminders/${habitId}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleReminder(habitId: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('User must be authenticated to toggle reminders');
    }
    
    return this.http.post(`${this.API_BASE_URL}/api/reminders/${habitId}/toggle`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw error;
  }
}

