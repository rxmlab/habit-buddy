    import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirstVisitService } from '../shared/services/first-visit.service';

@Component({
  selector: 'app-marketing-landing',
  template: `
    <!-- Simple Marketing Landing Page -->
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="relative overflow-hidden bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div class="text-center">
            <!-- Sanskrit Logo -->
            <div class="mb-12">
              <h1 class="text-6xl font-bold text-slate-800 mb-4">अभ्यास</h1>
              <h2 class="text-4xl font-bold text-slate-900 mb-6">Abhyatus</h2>
              <p class="text-xl text-slate-600 italic">"Discipline Through Practice"</p>
            </div>
            
            <!-- Main CTA -->
            <div class="mb-16">
              <button 
                (click)="startJourney()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-xl transition-colors">
                Let's Start Something
              </button>
            </div>
            
            <!-- Sanskrit Quote -->
            <div class="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto border border-gray-200">
              <p class="text-lg text-slate-800 mb-4">
                "अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते"
              </p>
              <p class="text-slate-600 italic">
                "Through practice and detachment, the mind can be controlled" - Bhagavad Gita 6.35
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Wisdom Section -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">Ancient Wisdom for Modern Life</h2>
            <p class="text-lg text-slate-600">
              The timeless principles of disciplined practice
            </p>
          </div>
          
          <div class="space-y-8">
            <!-- Quote 1 -->
            <div class="bg-white rounded-xl p-8 border border-gray-200">
              <p class="text-lg text-slate-800 mb-4">
                "योगः कर्मसु कौशलम्"
              </p>
              <p class="text-slate-600 italic mb-2">
                "Yoga is skill in action" - Bhagavad Gita 2.50
              </p>
              <p class="text-slate-700">
                True mastery comes not from avoiding action, but from performing it with skill, dedication, and mindfulness.
              </p>
            </div>
            
            <!-- Quote 2 -->
            <div class="bg-white rounded-xl p-8 border border-gray-200">
              <p class="text-lg text-slate-800 mb-4">
                "सततं कीर्तयन्तो मां यतन्तश्च दृढव्रताः"
              </p>
              <p class="text-slate-600 italic mb-2">
                "Always remembering Me, striving with determination" - Bhagavad Gita 8.14
              </p>
              <p class="text-slate-700">
                Consistency in practice, combined with unwavering determination, leads to transformation.
              </p>
            </div>
            
            <!-- Quote 3 -->
            <div class="bg-white rounded-xl p-8 border border-gray-200">
              <p class="text-lg text-slate-800 mb-4">
                "The mind is everything. What you think you become."
              </p>
              <p class="text-slate-600 italic mb-2">
                - Buddha
              </p>
              <p class="text-slate-700">
                Our thoughts shape our reality. Through disciplined practice, we can cultivate the mind we desire.
              </p>
            </div>
            
            <!-- Quote 4 -->
            <div class="bg-white rounded-xl p-8 border border-gray-200">
              <p class="text-lg text-slate-800 mb-4">
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
              </p>
              <p class="text-slate-600 italic mb-2">
                - Aristotle
              </p>
              <p class="text-slate-700">
                Greatness emerges from the small, consistent actions we take every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Philosophy Section -->
      <section class="py-20 bg-blue-600">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center text-white">
            <h2 class="text-3xl font-bold mb-8">The Meaning of Abhyāsa</h2>
            <div class="max-w-3xl mx-auto">
              <p class="text-lg mb-6">
                <strong>Abhyāsa</strong> (अभ्यास) is more than just practice - it represents the disciplined, 
                consistent effort that leads to mastery and transformation.
              </p>
              <p class="text-lg mb-8">
                It's about showing up every day with intention, building the habits that align with your highest self, 
                and discovering the freedom that comes from disciplined practice.
              </p>
              
              <div class="bg-white bg-opacity-10 rounded-lg p-6 border border-white border-opacity-20">
                <h3 class="text-xl font-semibold mb-3">Discipline is Freedom</h3>
                <p class="text-blue-100">
                  When you master the art of consistent practice, you free yourself from the chaos of inconsistency 
                  and unlock your true potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Simple CTA Section -->
      <section class="py-20 bg-white">
        <div class="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-6">Ready to Begin?</h2>
          <p class="text-lg text-slate-600 mb-8">
            Start building the habits that will transform your life
          </p>
          
          <button 
            (click)="startJourney()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-xl transition-colors">
            Create Your First Goal
          </button>
        </div>
      </section>

      <!-- Simple Footer -->
      <footer class="bg-slate-800 text-white py-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 class="text-2xl font-bold mb-4">अभ्यास</h3>
          <p class="text-slate-300 mb-4">
            Transform your life through the ancient wisdom of disciplined practice
          </p>
          <p class="text-sm text-slate-400">
            &copy; 2024 Abhyatus. Built with ancient wisdom and modern technology.
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Consistent with app theme */
    .min-h-screen {
      min-height: 100vh;
    }
    
    /* Smooth transitions */
    .transition-colors {
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
    
    /* Hover effects */
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Card hover effects */
    .bg-white:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    /* Consistent with app's focus styles */
    button:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `]
})
export class MarketingLandingComponent {
  constructor(
    private router: Router,
    private firstVisitService: FirstVisitService
  ) {}

  startJourney() {
    // Mark user as visited so they won't see marketing page again
    this.firstVisitService.markAsVisited();
    this.router.navigate(['/goals']);
  }
}
