import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirstVisitService {
  private readonly VISIT_KEY = 'abhyatus_first_visit';

  constructor() {}

  isFirstVisit(): boolean {
    const hasVisited = localStorage.getItem(this.VISIT_KEY);
    return hasVisited === null;
  }

  markAsVisited(): void {
    localStorage.setItem(this.VISIT_KEY, 'true');
  }

  resetFirstVisit(): void {
    localStorage.removeItem(this.VISIT_KEY);
  }
}
