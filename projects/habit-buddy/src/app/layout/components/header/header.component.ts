import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LogOut } from 'lucide-angular';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  protected readonly LogOutIcon = LogOut;
  
  // User signal from UserService
  protected user = this.userService.getUser();
  
  // Dropdown state
  protected isDropdownOpen = signal(false);

  toggleDropdown(): void {
    this.isDropdownOpen.update(value => !value);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
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
      this.closeDropdown();
      await this.authService.signOut();
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
