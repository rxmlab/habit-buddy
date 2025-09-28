import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LogOut } from 'lucide-angular';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

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
