import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthUser } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public authUser$ = this.authUserSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private userService = inject(UserService);
  private http = inject(HttpClient);
  
  // Current ID token
  private currentToken: string | null = null;
  private readonly API_URL = `${environment.apiUrl}/api/auth`;

  constructor() {
    // Check for local session (Native Auth)
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
        this.currentToken = token;
        const user = JSON.parse(userStr);
        this.authUserSubject.next(user);
        this.userService.setUser(user);
    }
  }

  // Sign in
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);
      const response = await firstValueFrom(
          this.http.post<{ access_token: string, user: any }>(`${this.API_URL}/login`, { email, password })
      );
      return this.handleLocalAuthSuccess(response);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Sign up
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);
      const response = await firstValueFrom(
          this.http.post<{ access_token: string, user: any }>(`${this.API_URL}/signup`, { email, password })
      );
      return this.handleLocalAuthSuccess(response);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      this.isLoadingSubject.next(true);
      this.clearLocalSession();
      this.isLoadingSubject.next(false);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Helper for Local Auth
  private handleLocalAuthSuccess(response: { access_token: string, user: any }): AuthUser {
      const authUser: AuthUser = {
          uid: response.user.uid,
          email: response.user.email,
          displayName: response.user.displayName || response.user.name,
          emailVerified: true,
          isAdmin: response.user.isAdmin
      };
      
      this.currentToken = response.access_token;
      this.authUserSubject.next(authUser);
      this.userService.setUser(authUser);
      
      // Persist session
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(authUser));
      
      this.isLoadingSubject.next(false);
      return authUser;
  }

  private clearLocalSession() {
      this.authUserSubject.next(null);
      this.userService.setUser(null);
      this.currentToken = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.authUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authUserSubject.value !== null;
  }

  // Get cached ID token (synchronous) - called by interceptor
  getCachedToken(): string | null {
    return this.currentToken;
  }

  async getIdToken(): Promise<string | null> {
    return this.currentToken;
  }

  async refreshIdToken(): Promise<string | null> {
    // Basic implementation - we just return current token.
    // In a full implementation, you'd call a /refresh endpoint.
    return this.currentToken;
  }

  // Error handling
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    // Check if it's an HTTP error from our local API
    if (error.error && error.error.detail) {
        return new Error(error.error.detail);
    }
    
    return new Error(error.message || message);
  }
}