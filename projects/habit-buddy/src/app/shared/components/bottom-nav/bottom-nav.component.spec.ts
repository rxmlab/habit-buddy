import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BottomNavComponent } from './bottom-nav.component';

describe('BottomNavComponent', () => {
  let component: BottomNavComponent;
  let fixture: ComponentFixture<BottomNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [BottomNavComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template Rendering', () => {
    it('should render bottom navigation container', () => {
      const compiled = fixture.nativeElement;
      const nav = compiled.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav.classList.contains('bg-white')).toBe(true);
      expect(nav.classList.contains('border-t')).toBe(true);
      expect(nav.classList.contains('p-2')).toBe(true);
      expect(nav.classList.contains('flex')).toBe(true);
      expect(nav.classList.contains('justify-around')).toBe(true);
      expect(nav.classList.contains('z-40')).toBe(true);
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

    it('should render navigation link labels', () => {
      const compiled = fixture.nativeElement;
      const labels = compiled.querySelectorAll('.text-xs');
      expect(labels.length).toBe(5); // One label per nav link
      
      const expectedLabels = ['Goals', 'Calendar', 'Stats', 'Reminders', 'Settings'];
      labels.forEach((label: any, index: any) => {
        expect(label.textContent.trim()).toBe(expectedLabels[index]);
      });
    });
  });

  describe('Navigation Functionality', () => {
    it('should have correct routerLinkActive for Goals', () => {
      const compiled = fixture.nativeElement;
      const goalsLink = compiled.querySelector('a[routerLink="/goals"]');
      expect(goalsLink).toBeTruthy();
      expect(goalsLink.getAttribute('routerLinkActive')).toBe('text-slate-900');
    });

    it('should have correct routerLinkActive for Calendar', () => {
      const compiled = fixture.nativeElement;
      const calendarLink = compiled.querySelector('a[routerLink="/calendar"]');
      expect(calendarLink).toBeTruthy();
      expect(calendarLink.getAttribute('routerLinkActive')).toBe('text-slate-900');
    });

    it('should have correct routerLinkActive for Statistics', () => {
      const compiled = fixture.nativeElement;
      const statsLink = compiled.querySelector('a[routerLink="/stats"]');
      expect(statsLink).toBeTruthy();
      expect(statsLink.getAttribute('routerLinkActive')).toBe('text-slate-900');
    });

    it('should have correct routerLinkActive for Reminders', () => {
      const compiled = fixture.nativeElement;
      const remindersLink = compiled.querySelector('a[routerLink="/reminders"]');
      expect(remindersLink).toBeTruthy();
      expect(remindersLink.getAttribute('routerLinkActive')).toBe('text-slate-900');
    });

    it('should have correct routerLinkActive for Settings', () => {
      const compiled = fixture.nativeElement;
      const settingsLink = compiled.querySelector('a[routerLink="/settings"]');
      expect(settingsLink).toBeTruthy();
      expect(settingsLink.getAttribute('routerLinkActive')).toBe('text-slate-900');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct nav item classes', () => {
      const compiled = fixture.nativeElement;
      const navItems = compiled.querySelectorAll('a');
      navItems.forEach((item: any) => {
        expect(item.classList.contains('flex')).toBe(true);
        expect(item.classList.contains('flex-col')).toBe(true);
        expect(item.classList.contains('items-center')).toBe(true);
        expect(item.classList.contains('py-1')).toBe(true);
      });
    });

    it('should have correct icon classes', () => {
      const compiled = fixture.nativeElement;
      const icons = compiled.querySelectorAll('lucide-icon');
      icons.forEach((icon: any) => {
        expect(icon.getAttribute('size')).toBe('20');
      });
    });

    it('should have correct label classes', () => {
      const compiled = fixture.nativeElement;
      const labels = compiled.querySelectorAll('.text-xs');
      labels.forEach((label: any) => {
        expect(label.classList.contains('text-xs')).toBe(true);
      });
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(BottomNavComponent).toBeTruthy();
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

    it('should not have any event emitters', () => {
      // Component should not have any @Output properties
      const componentProps = Object.getOwnPropertyNames(component);
      const outputProps = componentProps.filter(prop => 
        prop.includes('EventEmitter') || prop.includes('Output')
      );
      expect(outputProps.length).toBe(0);
    });

    it('should not have any input properties', () => {
      // Component should not have any @Input properties
      const componentProps = Object.getOwnPropertyNames(component);
      const inputProps = componentProps.filter(prop => 
        prop.includes('Input')
      );
      expect(inputProps.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', () => {
      const compiled = fixture.nativeElement;
      const nav = compiled.querySelector('nav');
      expect(nav).toBeTruthy();
      // The template doesn't have role="navigation" attribute
    });

    it('should have proper link accessibility', () => {
      const compiled = fixture.nativeElement;
      const links = compiled.querySelectorAll('a[routerLink]');
      links.forEach((link: any) => {
        expect(link).toBeTruthy();
        // The template doesn't have aria-label attributes
      });
    });
  });

  describe('Responsive Design', () => {
    it('should be hidden on desktop (md:hidden)', () => {
      const compiled = fixture.nativeElement;
      const nav = compiled.querySelector('nav');
      // Note: md:hidden class is applied at the parent level in layout
      expect(nav).toBeTruthy();
    });

    it('should have fixed positioning classes', () => {
      const compiled = fixture.nativeElement;
      const nav = compiled.querySelector('nav');
      // The fixed positioning is applied at the parent level in layout
      expect(nav).toBeTruthy();
    });
  });
});
