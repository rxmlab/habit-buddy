import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Observable } from 'rxjs';
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



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public authUser$ = this.authUserSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private userService = inject(UserService);
  
  // Current Firebase ID token
  private currentToken: string | null = null;

  constructor() {
    // Listen to Firebase auth state changes
    onAuthStateChanged(auth, async (user: User | null) => {
      console.log('Auth state changed:', user);
      if (user) {
        const authUser = this.mapFirebaseUserToAuthUser(user);
        this.authUserSubject.next(authUser);
        this.userService.setUser(authUser);
        // Cache the token
        this.currentToken = await user.getIdToken();
      } else {
        this.authUserSubject.next(null);
        this.userService.setUser(null);
        this.currentToken = null;
      }
      this.isLoadingSubject.next(false);
    });
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Immediately get and cache token
      this.currentToken = await userCredential.user.getIdToken();
      return this.mapFirebaseUserToAuthUser(userCredential.user);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      this.isLoadingSubject.next(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Immediately get and cache token
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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Immediately get and cache token
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
      await signOut(auth);
    } catch (error) {
      this.isLoadingSubject.next(false);
      throw this.handleAuthError(error);
    }
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