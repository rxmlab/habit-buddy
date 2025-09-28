import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { HabitService } from '../../../shared/services/habit.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let habitService: jasmine.SpyObj<HabitService>;

  beforeEach(async () => {
    const habitServiceSpy = jasmine.createSpyObj('HabitService', ['exportHabits', 'importHabits'], {
      habits$: signal([])
    });

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: HabitService, useValue: habitServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    habitService = TestBed.inject(HabitService) as jasmine.SpyObj<HabitService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template Rendering', () => {
    it('should render sidebar container', () => {
      const compiled = fixture.nativeElement;
      const sidebar = compiled.querySelector('aside');
      expect(sidebar).toBeTruthy();
      expect(sidebar.classList.contains('bg-white')).toBe(true);
      expect(sidebar.classList.contains('border-r')).toBe(true);
      expect(sidebar.classList.contains('p-4')).toBe(true);
      expect(sidebar.classList.contains('flex')).toBe(true);
      expect(sidebar.classList.contains('flex-col')).toBe(true);
    });

    it('should render sidebar branding section', () => {
      const compiled = fixture.nativeElement;
      const branding = compiled.querySelector('.sidebar-branding');
      expect(branding).toBeTruthy();
    });

    it('should render brand section', () => {
      const compiled = fixture.nativeElement;
      const brandSection = compiled.querySelector('.brand-section');
      expect(brandSection).toBeTruthy();
    });

    it('should render logo container', () => {
      const compiled = fixture.nativeElement;
      const logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer).toBeTruthy();
    });

    it('should render brand logo image', () => {
      const compiled = fixture.nativeElement;
      const logo = compiled.querySelector('.brand-logo');
      expect(logo).toBeTruthy();
      expect(logo.tagName).toBe('IMG');
      expect(logo.src).toContain('logo.svg');
      expect(logo.alt).toBe('HabitBuddy');
    });

    it('should render brand info section', () => {
      const compiled = fixture.nativeElement;
      const brandInfo = compiled.querySelector('.brand-info');
      expect(brandInfo).toBeTruthy();
    });

    it('should display HabitBuddy title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.brand-title');
      expect(title).toBeTruthy();
      expect(title.textContent.trim()).toBe('HabitBuddy');
    });

    it('should display brand tagline', () => {
      const compiled = fixture.nativeElement;
      const tagline = compiled.querySelector('.brand-tagline');
      expect(tagline).toBeTruthy();
      expect(tagline.textContent.trim()).toBe('Build Better Habits');
    });

    it('should display brand features', () => {
      const compiled = fixture.nativeElement;
      const features = compiled.querySelector('.brand-features');
      expect(features).toBeTruthy();
      expect(features.textContent.trim()).toBe('Reminders • Anti-cheat • Cross-device ready');
    });

    it('should render navigation section', () => {
      const compiled = fixture.nativeElement;
      const nav = compiled.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav.classList.contains('flex-1')).toBe(true);
      expect(nav.classList.contains('flex')).toBe(true);
      expect(nav.classList.contains('flex-col')).toBe(true);
      expect(nav.classList.contains('space-y-2')).toBe(true);
    });

    it('should render all navigation links', () => {
      const compiled = fixture.nativeElement;
      const navLinks = compiled.querySelectorAll('a[routerLink]');
      expect(navLinks.length).toBe(5);
      
      const expectedRoutes = ['/goals', '/calendar', '/stats', '/reminders', '/settings'];
      navLinks.forEach((link: any, index: any) => {
        expect(link.getAttribute('routerLink')).toBe(expectedRoutes[index]);
      });
    });

    it('should render navigation link icons', () => {
      const compiled = fixture.nativeElement;
      const icons = compiled.querySelectorAll('lucide-icon');
      expect(icons.length).toBe(5); // One icon per nav link
    });

    it('should render footer text', () => {
      const compiled = fixture.nativeElement;
      const footer = compiled.querySelector('.mt-4.text-xs.text-slate-400');
      expect(footer).toBeTruthy();
      expect(footer.textContent.trim()).toBe('Local-first • No account required');
    });
  });

  describe('Navigation Functionality', () => {
    it('should have correct routerLinkActive for Goals', () => {
      const compiled = fixture.nativeElement;
      const goalsLink = compiled.querySelector('a[routerLink="/goals"]');
      expect(goalsLink.classList.contains('nav-btn')).toBe(true);
      expect(goalsLink.getAttribute('routerLinkActive')).toBe('bg-slate-100');
    });

    it('should have correct routerLinkActive for Calendar', () => {
      const compiled = fixture.nativeElement;
      const calendarLink = compiled.querySelector('a[routerLink="/calendar"]');
      expect(calendarLink.classList.contains('nav-btn')).toBe(true);
      expect(calendarLink.getAttribute('routerLinkActive')).toBe('bg-slate-100');
    });

    it('should have correct routerLinkActive for Statistics', () => {
      const compiled = fixture.nativeElement;
      const statsLink = compiled.querySelector('a[routerLink="/stats"]');
      expect(statsLink.classList.contains('nav-btn')).toBe(true);
      expect(statsLink.getAttribute('routerLinkActive')).toBe('bg-slate-100');
    });

    it('should have correct routerLinkActive for Reminders', () => {
      const compiled = fixture.nativeElement;
      const remindersLink = compiled.querySelector('a[routerLink="/reminders"]');
      expect(remindersLink.classList.contains('nav-btn')).toBe(true);
      expect(remindersLink.getAttribute('routerLinkActive')).toBe('bg-slate-100');
    });

    it('should have correct routerLinkActive for Settings', () => {
      const compiled = fixture.nativeElement;
      const settingsLink = compiled.querySelector('a[routerLink="/settings"]');
      expect(settingsLink.classList.contains('nav-btn')).toBe(true);
      expect(settingsLink.getAttribute('routerLinkActive')).toBe('bg-slate-100');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct sidebar branding classes', () => {
      const compiled = fixture.nativeElement;
      const branding = compiled.querySelector('.sidebar-branding');
      expect(branding.classList.contains('sidebar-branding')).toBe(true);
    });

    it('should have correct brand section classes', () => {
      const compiled = fixture.nativeElement;
      const brandSection = compiled.querySelector('.brand-section');
      expect(brandSection.classList.contains('brand-section')).toBe(true);
    });

    it('should have correct logo container classes', () => {
      const compiled = fixture.nativeElement;
      const logoContainer = compiled.querySelector('.logo-container');
      expect(logoContainer.classList.contains('logo-container')).toBe(true);
    });

    it('should have correct brand logo classes', () => {
      const compiled = fixture.nativeElement;
      const logo = compiled.querySelector('.brand-logo');
      expect(logo.classList.contains('brand-logo')).toBe(true);
    });

    it('should have correct brand info classes', () => {
      const compiled = fixture.nativeElement;
      const brandInfo = compiled.querySelector('.brand-info');
      expect(brandInfo.classList.contains('brand-info')).toBe(true);
    });

    it('should have correct brand title classes', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.brand-title');
      expect(title.classList.contains('brand-title')).toBe(true);
    });

    it('should have correct brand tagline classes', () => {
      const compiled = fixture.nativeElement;
      const tagline = compiled.querySelector('.brand-tagline');
      expect(tagline.classList.contains('brand-tagline')).toBe(true);
    });

    it('should have correct brand features classes', () => {
      const compiled = fixture.nativeElement;
      const features = compiled.querySelector('.brand-features');
      expect(features.classList.contains('brand-features')).toBe(true);
    });

    it('should have correct nav button classes', () => {
      const compiled = fixture.nativeElement;
      const navButtons = compiled.querySelectorAll('.nav-btn');
      navButtons.forEach((button: any) => {
        expect(button.classList.contains('nav-btn')).toBe(true);
        expect(button.classList.contains('w-full')).toBe(true);
        expect(button.classList.contains('text-left')).toBe(true);
        expect(button.classList.contains('px-3')).toBe(true);
        expect(button.classList.contains('py-2')).toBe(true);
        expect(button.classList.contains('rounded')).toBe(true);
        expect(button.classList.contains('hover:bg-slate-100')).toBe(true);
        expect(button.classList.contains('flex')).toBe(true);
        expect(button.classList.contains('items-center')).toBe(true);
        expect(button.classList.contains('gap-2')).toBe(true);
      });
    });
  });

  describe('Image Fallback', () => {
    it('should have onerror handler for logo fallback', () => {
      const compiled = fixture.nativeElement;
      const logo = compiled.querySelector('.brand-logo');
      expect(logo.onerror).toBeTruthy();
    });

    it('should fallback to PNG if SVG fails to load', () => {
      const compiled = fixture.nativeElement;
      const logo = compiled.querySelector('.brand-logo');
      
      // Simulate error event
      const errorEvent = new Event('error');
      logo.dispatchEvent(errorEvent);
      
      // Check if src was updated to fallback
      expect(logo.src).toContain('habitbuddy_vector_64.png');
    });
  });

  describe('Service Integration', () => {
    it('should inject HabitService correctly', () => {
      expect(habitService).toBeTruthy();
    });

    it('should have access to habits$ observable', () => {
      expect(habitService.habits$).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(SidebarComponent).toBeTruthy();
    });

    it('should have RouterModule imported', () => {
      const compiled = fixture.nativeElement;
      const routerLinks = compiled.querySelectorAll('a[routerLink]');
      expect(routerLinks.length).toBeGreaterThan(0);
    });

    it('should have LucideAngularModule imported for icons', () => {
      const compiled = fixture.nativeElement;
      const icons = compiled.querySelectorAll('lucide-icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
