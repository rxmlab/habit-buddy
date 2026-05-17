import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authService.getCurrentUser();
    
    if (user && user.isAdmin) {
      return true;
    }
    
    // Not an admin, redirect to goals
    return this.router.createUrlTree(['/goals']);
  }
}
