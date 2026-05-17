import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-angular';

import { AuthService } from '../shared/services/auth.service';
import { AuthUser } from '../shared/interfaces/user.interface';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  authForm: FormGroup;
  isSignUp = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  
  // Icons
  MailIcon = Mail;
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;
  LogInIcon = LogIn;
  UserPlusIcon = UserPlus;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authService.authUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: AuthUser | null) => {
        if (user) {
          this.router.navigate(['/goals']);
        }
      });

    // Listen to loading state
    this.authService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSignUp(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.authForm.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.valid && !this.isLoading) {
      this.errorMessage = '';
      const { email, password } = this.authForm.value;

      try {
        if (this.isSignUp) {
          await this.authService.signUp(email, password);
        } else {
          await this.authService.signIn(email, password);
        }
        
        // Redirect to goals page after successful authentication
        this.router.navigate(['/goals']);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      }
    }
  }



  getFieldError(fieldName: string): string {
    const field = this.authForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters';
      }
    }
    return '';
  }
}
