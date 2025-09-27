import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Download } from 'lucide-angular';

@Component({
  selector: 'app-pwa-prompt',
  template: `
    @if (showInstallPrompt()) {
      <!-- Install Prompt - Modern Card Design -->
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"></div>
        
        <!-- Card -->
        <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 transform animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-500 ease-out">
          <!-- Gradient Header -->
          <div class="relative h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-t-2xl overflow-hidden">
            <!-- Pattern Overlay -->
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
            </div>
            
            <!-- Close Button -->
            <button 
              (click)="dismissPrompt()" 
              class="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
              aria-label="Dismiss">
              <lucide-icon [img]="XIcon" size="14" />
            </button>
            
            <!-- App Icon -->
            <div class="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center">
              <img src="./logo/android-icon-96x96.png" alt="HabitBuddy" class="w-10 h-10 rounded-lg">
            </div>
          </div>
          
          <!-- Content -->
          <div class="pt-12 pb-6 px-6">
            <!-- Title -->
            <div class="mb-4">
              <h3 class="text-xl font-bold text-gray-900 mb-1">Install HabitBuddy</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Get quick access to your habits with our beautiful app. Works offline and syncs across devices.
              </p>
            </div>
            
            <!-- Features -->
            <div class="space-y-2 mb-6">
              <div class="flex items-center text-sm text-gray-700">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>Offline access to your habits</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Fast loading and smooth experience</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span>Push notifications for reminders</span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="space-y-3">
              <button 
                (click)="installApp()" 
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl">
                <div class="flex items-center justify-center">
                  <lucide-icon [img]="DownloadIcon" size="18" class="mr-2" />
                  Install App
                </div>
              </button>
              <button 
                (click)="dismissPrompt()" 
                class="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    }
    
    @if (showUpdatePrompt()) {
      <!-- Update Prompt - Modern Design -->
      <div class="fixed top-4 right-4 z-50 w-full max-w-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform animate-in slide-in-from-right-full duration-500 ease-out">
          <!-- Header -->
          <div class="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                  <lucide-icon [img]="DownloadIcon" size="20" class="text-white" />
                </div>
                <div>
                  <h3 class="text-white font-bold text-sm">Update Available</h3>
                  <p class="text-white/80 text-xs">New features ready</p>
                </div>
              </div>
              <button 
                (click)="dismissUpdate()" 
                class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                aria-label="Dismiss">
                <lucide-icon [img]="XIcon" size="14" />
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <p class="text-gray-700 text-sm mb-4 leading-relaxed">
              We've added new features and improvements. Update now to get the best experience.
            </p>
            
            <!-- Actions -->
            <div class="flex gap-3">
              <button 
                (click)="updateApp()" 
                class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl">
                Update Now
              </button>
              <button 
                (click)="dismissUpdate()" 
                class="px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200">
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  imports: [CommonModule, LucideAngularModule]
})
export class PwaPromptComponent implements OnInit, OnDestroy {
  private swUpdate = inject(SwUpdate);
  private deferredPrompt: any = null;
  
  // Icon properties
  DownloadIcon = Download;
  XIcon = X;
  
  showInstallPrompt = signal(false);
  showUpdatePrompt = signal(false);
  private promptDismissed = signal(false);

  ngOnInit() {
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (!this.promptDismissed()) {
        this.showInstallPrompt.set(true);
      }
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.showInstallPrompt.set(false);
      this.deferredPrompt = null;
    });

    // Listen for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event: any) => {
        if (event.type === 'VERSION_READY') {
          this.showUpdatePrompt.set(true);
        }
      });
    }
  }

  ngOnDestroy() {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', this.handleAppInstalled);
  }

  private handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    this.deferredPrompt = e;
    if (!this.promptDismissed()) {
      this.showInstallPrompt.set(true);
    }
  }

  private handleAppInstalled = () => {
    this.showInstallPrompt.set(false);
    this.deferredPrompt = null;
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      this.deferredPrompt = null;
    }
    this.showInstallPrompt.set(false);
  }

  dismissPrompt() {
    this.showInstallPrompt.set(false);
    this.promptDismissed.set(true);
    // Store dismissal in localStorage
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  }

  async updateApp() {
    if (this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate();
      window.location.reload();
    }
  }

  dismissUpdate() {
    this.showUpdatePrompt.set(false);
  }
}
