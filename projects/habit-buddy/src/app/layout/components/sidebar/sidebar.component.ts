import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import {
  LucideAngularModule,
  Home,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  LogOut,
} from 'lucide-angular';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Lucide icons
  protected readonly HomeIcon = Home;
  protected readonly CalendarIcon = Calendar;
  protected readonly BarChart3Icon = BarChart3;
  protected readonly ClockIcon = Clock;
  protected readonly SettingsIcon = Settings;
  protected readonly LogOutIcon = LogOut;

  protected readonly isAuthenticated = signal(false);
  
  // User signal from UserService
  protected user = this.userService.getUser();

  ngOnInit(): void {
    this.authService.authUser$.subscribe((user) => {
      this.isAuthenticated.set(this.authService.isAuthenticated());
    });
  }

  // Get user initials for avatar
  protected getUserInitials(): string {
    const currentUser = this.user();
    if (!currentUser) return '?';
    
    if (currentUser.displayName) {
      const names = currentUser.displayName.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return currentUser.displayName.substring(0, 2).toUpperCase();
    }
    
    if (currentUser.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    
    return '??';
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/marketing']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
