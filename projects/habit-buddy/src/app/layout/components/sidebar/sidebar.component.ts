import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Home, Calendar, BarChart3, Clock, Settings, LogOut } from 'lucide-angular';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Lucide icons
  protected readonly HomeIcon = Home;
  protected readonly CalendarIcon = Calendar;
  protected readonly BarChart3Icon = BarChart3;
  protected readonly ClockIcon = Clock;
  protected readonly SettingsIcon = Settings;
  protected readonly LogOutIcon = LogOut;

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/marketing']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}