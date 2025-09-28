import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  Habit, 
  HabitStats, 
  Reminder, 
  WeeklyTrend, 
  MonthlyTrend, 
  YearlyTrend, 
  HabitBadge, 
  BadgeLevel 
} from '../models/habit.model';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../../../firebase.config';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // API base URL - now uses environment variable
  private readonly API_BASE_URL = environment.apiUrl;
  
  // Authentication state
  private authUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public authUser$ = this.authUserSubject.asObservable();
  
  // Current Firebase ID token
  private currentToken: string | null = null;

  constructor() {
    // Listen to Firebase auth state changes
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const token = await user.getIdToken();
        this.currentToken = token;
        this.authUserSubject.next({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        this.currentToken = null;
        this.authUserSubject.next(null);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.currentToken) {
      return headers.set('Authorization', `Bearer ${this.currentToken}`);
    }

    return headers;
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      this.currentToken = token;
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      this.currentToken = token;
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentToken = null;
    } catch (error) {
      throw error;
    }
  }

  // Habit CRUD operations
  getHabits(): Observable<Habit[]> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access habits');
    }
    
    return this.http.get<Habit[]>(`${this.API_BASE_URL}/api/habits`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHabit(id: string): Observable<Habit> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access habits');
    }
    
    return this.http.get<Habit>(`${this.API_BASE_URL}/api/habits/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  createHabit(habit: Partial<Habit>): Observable<Habit> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to create habits');
    }
    
    return this.http.post<Habit>(`${this.API_BASE_URL}/api/habits`, habit, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateHabit(id: string, habit: Partial<Habit>): Observable<Habit> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to update habits');
    }
    
    return this.http.put<Habit>(`${this.API_BASE_URL}/api/habits/${id}`, habit, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteHabit(id: string): Observable<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to delete habits');
    }
    
    return this.http.delete<void>(`${this.API_BASE_URL}/api/habits/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Check-in operations
  checkInHabit(habitId: string, date?: string): Observable<any> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to check in habits');
    }
    
    const body: { habit_id: string; check_in_date?: string } = { habit_id: habitId };
    if (date) {
      body.check_in_date = date;
    }
    
    return this.http.post(`${this.API_BASE_URL}/api/habits/${habitId}/check-in`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteCheckIn(habitId: string, date: string): Observable<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to delete check-ins');
    }
    
    return this.http.delete<void>(`${this.API_BASE_URL}/api/habits/${habitId}/check-in/${date}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Statistics operations
  getOverviewStats(): Observable<any> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access statistics');
    }
    
    return this.http.get(`${this.API_BASE_URL}/api/stats/overview`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHabitStats(habitId: string): Observable<any> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access statistics');
    }
    
    return this.http.get(`${this.API_BASE_URL}/api/stats/habit/${habitId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getAllHabitsStats(): Observable<any[]> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access statistics');
    }
    
    return this.http.get<any[]>(`${this.API_BASE_URL}/api/stats/habits`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Reminder operations
  getReminders(): Observable<any[]> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access reminders');
    }
    
    return this.http.get<any[]>(`${this.API_BASE_URL}/api/reminders`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHabitReminder(habitId: string): Observable<Reminder> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access reminders');
    }
    
    return this.http.get<Reminder>(`${this.API_BASE_URL}/api/reminders/${habitId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateHabitReminder(habitId: string, reminder: Reminder): Observable<Reminder> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to update reminders');
    }
    
    return this.http.put<Reminder>(`${this.API_BASE_URL}/api/reminders/${habitId}`, reminder, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteHabitReminder(habitId: string): Observable<void> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to delete reminders');
    }
    
    return this.http.delete<void>(`${this.API_BASE_URL}/api/reminders/${habitId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  toggleReminder(habitId: string): Observable<any> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to toggle reminders');
    }
    
    return this.http.post(`${this.API_BASE_URL}/api/reminders/${habitId}/toggle`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // User operations
  getUserProfile(): Observable<any> {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to access profile');
    }
    
    return this.http.get(`${this.API_BASE_URL}/api/auth/me`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    throw error;
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentToken !== null;
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.authUserSubject.value;
  }
}