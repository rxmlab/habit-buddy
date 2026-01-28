import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../../firebase.config';
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
    // 1. Check for local dev session (Native Auth)
    if (isDevMode()) {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            this.currentToken = token;
            const user = JSON.parse(userStr);
            this.authUserSubject.next(user);
            this.userService.setUser(user);
        }
    }

    // 2. Listen to Firebase auth state changes (Prod / Firebase Mode)
    onAuthStateChanged(auth, async (user: User | null) => {
      // If we are in dev mode and have a local token, ignore Firebase updates to avoid conflicts
      if (isDevMode() && this.currentToken) return;

      console.log('Auth state changed:', user);
      if (user) {
        const authUser = this.mapFirebaseUserToAuthUser(user);
        this.authUserSubject.next(authUser);
        this.userService.setUser(authUser);
        this.currentToken = await user.getIdToken();
      } else {
        // Only clear if NOT using local auth
        if (!isDevMode() || !localStorage.getItem('access_token')) {
            this.authUserSubject.next(null);
            this.userService.setUser(null);
            this.currentToken = null;
        }
      }
      this.isLoadingSubject.next(false);
    });
  }

  // Sign in
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);
      
      if (isDevMode()) {
        // Native Login
        const response = await firstValueFrom(
            this.http.post<{ access_token: string, user: any }>(`${this.API_URL}/login`, { email, password })
        );
        return this.handleLocalAuthSuccess(response);
      }

      // Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      this.currentToken = await userCredential.user.getIdToken();
      return this.mapFirebaseUserToAuthUser(userCredential.user);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Sign up
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);

      if (isDevMode()) {
        // Native Signup
        const response = await firstValueFrom(
            this.http.post<{ access_token: string, user: any }>(`${this.API_URL}/signup`, { email, password })
        );
        return this.handleLocalAuthSuccess(response);
      }

      // Firebase Signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      this.currentToken = await userCredential.user.getIdToken();
      return this.mapFirebaseUserToAuthUser(userCredential.user);

    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);

      if (isDevMode()) {
        throw new Error("Google Sign-In is not supported in local dev mode. Please use Email/Password.");
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      this.currentToken = await result.user.getIdToken();
      return this.mapFirebaseUserToAuthUser(result.user);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      this.isLoadingSubject.next(true);
      
      if (isDevMode()) {
          this.clearLocalSession();
          this.isLoadingSubject.next(false);
          return;
      }

      await signOut(auth);
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
          displayName: response.user.displayName,
          emailVerified: true
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

  // Get current Firebase user
  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  }

  // Get cached ID token (synchronous) - called by interceptor
  getCachedToken(): string | null {
    return this.currentToken;
  }

  // Get ID token (async - fetches fresh token)
  async getIdToken(): Promise<string | null> {
    if (isDevMode() && this.currentToken) {
        return this.currentToken;
    }
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      this.currentToken = token; // Update cache
      return token;
    }
    return null;
  }

  // Refresh ID token
  async refreshIdToken(): Promise<string | null> {
    if (isDevMode() && this.currentToken) {
        return this.currentToken;
    }
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      this.currentToken = token; // Update cache
      return token;
    }
    return null;
  }

  // Map Firebase User to AuthUser
  private mapFirebaseUserToAuthUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    };
  }

  // Error handling
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    // Check if it's an HTTP error from our local API
    if (error.error && error.error.detail) {
        return new Error(error.error.detail);
    }
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No user found with this email address';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection';
          break;
        case 'auth/popup-closed-by-user':
          message = 'Sign-in popup was closed';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Sign-in was cancelled';
          break;
        default:
          message = error.message || message;
      }
    }
    
    return new Error(message);
  }
}