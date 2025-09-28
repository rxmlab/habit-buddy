import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirstVisitService } from '../shared/services/first-visit.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-slate-600">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private firstVisitService: FirstVisitService
  ) {}

  ngOnInit() {
    // Check if this is the user's first visit
    if (this.firstVisitService.isFirstVisit()) {
      // First time - show marketing page
      this.router.navigate(['/marketing']);
    } else {
      // Returning user - go directly to goals
      this.router.navigate(['/goals']);
    }
  }
}
