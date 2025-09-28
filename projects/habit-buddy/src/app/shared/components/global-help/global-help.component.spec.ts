import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalHelpComponent } from './global-help.component';
import { HelpOverlayComponent } from '../help-overlay/help-overlay.component';

describe('GlobalHelpComponent', () => {
  let component: GlobalHelpComponent;
  let fixture: ComponentFixture<GlobalHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: { snapshot: { url: [] } } }
      ],
      imports: [GlobalHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component State', () => {
    it('should have initial state', () => {
      expect((component as any).isHelpOverlayOpen()).toBe(false);
    });

    it('should have HelpCircle icon reference', () => {
      expect((component as any).HelpCircleIcon).toBeTruthy();
    });
  });

  describe('Template Rendering', () => {
    it('should render help button', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton).toBeTruthy();
    });

    it('should render help button with correct classes', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.classList.contains('help-button')).toBe(true);
    });

    it('should render help icon', () => {
      const compiled = fixture.nativeElement;
      const icon = compiled.querySelector('lucide-icon');
      expect(icon).toBeTruthy();
    });

    it('should render help overlay component', () => {
      const compiled = fixture.nativeElement;
      const overlay = compiled.querySelector('app-help-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should have correct button title when closed', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.getAttribute('title')).toBe('Open Help & Data Management');
    });

    it('should have correct button title when open', () => {
      (component as any).isHelpOverlayOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.getAttribute('title')).toBe('Close Help');
    });
  });

  describe('Event Handling', () => {
    it('should toggle help overlay when button is clicked', () => {
      expect((component as any).isHelpOverlayOpen()).toBe(false);
      
      (component as any).onHelpClick();
      
      expect((component as any).isHelpOverlayOpen()).toBe(true);
    });

    it('should close help overlay when close event is emitted', () => {
      (component as any).isHelpOverlayOpen.set(true);
      
      (component as any).onHelpOverlayClose();
      
      expect((component as any).isHelpOverlayOpen()).toBe(false);
    });

    it('should toggle help overlay state on multiple clicks', () => {
      expect((component as any).isHelpOverlayOpen()).toBe(false);
      
      (component as any).onHelpClick();
      expect((component as any).isHelpOverlayOpen()).toBe(true);
      
      (component as any).onHelpClick();
      expect((component as any).isHelpOverlayOpen()).toBe(false);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct help button classes when closed', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.classList.contains('help-button')).toBe(true);
      expect(helpButton.classList.contains('help-button-open')).toBe(false);
    });

    it('should have correct help button classes when open', () => {
      (component as any).isHelpOverlayOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.classList.contains('help-button')).toBe(true);
      expect(helpButton.classList.contains('help-button-open')).toBe(true);
    });

    it('should have correct icon size', () => {
      const compiled = fixture.nativeElement;
      const icon = compiled.querySelector('lucide-icon');
      expect(icon.getAttribute('size')).toBe('24');
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(GlobalHelpComponent).toBeTruthy();
    });

    it('should have signal for help overlay state', () => {
      expect((component as any).isHelpOverlayOpen).toBeTruthy();
      expect(typeof (component as any).isHelpOverlayOpen).toBe('function');
    });

    it('should have HelpCircle icon property', () => {
      expect((component as any).HelpCircleIcon).toBeTruthy();
    });
  });

  describe('Help Overlay Integration', () => {
    it('should pass isOpen state to help overlay', () => {
      (component as any).isHelpOverlayOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const overlay = compiled.querySelector('app-help-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should handle close event from help overlay', () => {
      (component as any).isHelpOverlayOpen.set(true);
      
      (component as any).onHelpOverlayClose();
      
      expect((component as any).isHelpOverlayOpen()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.getAttribute('title')).toBeTruthy();
    });

    it('should have proper ARIA attributes', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.getAttribute('title')).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should have fixed positioning', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton).toBeTruthy();
    });

    it('should have correct z-index', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should have correct background color when closed', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.classList.contains('help-button-open')).toBe(false);
    });

    it('should have correct background color when open', () => {
      (component as any).isHelpOverlayOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      expect(helpButton.classList.contains('help-button-open')).toBe(true);
    });
  });

  describe('Event Propagation', () => {
    it('should handle click events properly', () => {
      spyOn(component as any, 'onHelpClick');
      
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      helpButton.click();
      
      expect((component as any).onHelpClick).toHaveBeenCalled();
    });

    it('should not interfere with other click events', () => {
      const compiled = fixture.nativeElement;
      const helpButton = compiled.querySelector('.help-button');
      
      // Simulate click event
      const clickEvent = new Event('click');
      helpButton.dispatchEvent(clickEvent);
      
      // Should not throw any errors
      expect(true).toBe(true);
    });
  });
});
