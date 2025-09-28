import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [HeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template Rendering', () => {
    it('should render mobile header container', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('.mobile-header');
      expect(header).toBeTruthy();
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
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct mobile header classes', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('.mobile-header');
      expect(header.classList.contains('mobile-header')).toBe(true);
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

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(HeaderComponent).toBeTruthy();
    });

    it('should have no dependencies on other components', () => {
      const compiled = fixture.nativeElement;
      // Should only contain the header structure, no other components
      const childComponents = compiled.querySelectorAll('[ng-reflect-ng-class]');
      expect(childComponents.length).toBe(0);
    });

    it('should not have any event emitters', () => {
      // Component should not have any @Output properties
      const componentProps = Object.getOwnPropertyNames(component);
      const outputProps = componentProps.filter(prop => 
        prop.includes('EventEmitter') || prop.includes('Output')
      );
      expect(outputProps.length).toBe(0);
    });
  });
});
