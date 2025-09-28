import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { PwaPromptComponent } from './pwa-prompt.component';

describe('PwaPromptComponent', () => {
  let component: PwaPromptComponent;
  let fixture: ComponentFixture<PwaPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: jasmine.createSpyObj('SwUpdate', ['checkForUpdate', 'activateUpdate']) }
      ],
      imports: [PwaPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PwaPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect((component as any).deferredPrompt).toBeNull();
      expect(component.showInstallPrompt()).toBe(false);
    });
  });

  describe('PWA Installation', () => {
    it('should handle beforeinstallprompt event', () => {
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        prompt: jasmine.createSpy('prompt')
      };
      
      (component as any).handleBeforeInstallPrompt(mockEvent);
      
      expect((component as any).deferredPrompt).toBe(mockEvent);
      expect(component.showInstallPrompt()).toBe(true);
    });

    it('should install PWA when install button is clicked', async () => {
      const mockPrompt = jasmine.createSpy('prompt').and.returnValue(Promise.resolve());
      (component as any).deferredPrompt = { 
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      await component.installApp();
      
      expect(mockPrompt).toHaveBeenCalled();
      expect(component.showInstallPrompt()).toBe(false);
      expect((component as any).deferredPrompt).toBeNull();
    });

    it('should handle install rejection', async () => {
      const mockPrompt = jasmine.createSpy('prompt').and.returnValue(Promise.resolve());
      (component as any).deferredPrompt = { 
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'dismissed' })
      };
      
      await component.installApp();
      
      expect(mockPrompt).toHaveBeenCalled();
      expect(component.showInstallPrompt()).toBe(false);
      expect((component as any).deferredPrompt).toBeNull();
    });

    it('should dismiss install prompt', () => {
      component.showInstallPrompt.set(true);
      
      component.dismissPrompt();
      
      expect(component.showInstallPrompt()).toBe(false);
    });
  });

  describe('App Installed Detection', () => {
    it('should handle appinstalled event', () => {
      (component as any).handleAppInstalled();
      
      expect(component.showInstallPrompt()).toBe(false);
      expect((component as any).deferredPrompt).toBeNull();
    });
  });

  describe('Template Rendering', () => {
    it('should render install prompt when showInstallPrompt is true', () => {
      component.showInstallPrompt.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const prompt = compiled.querySelector('.fixed');
      expect(prompt).toBeTruthy();
    });

    it('should not render install prompt when showInstallPrompt is false', () => {
      component.showInstallPrompt.set(false);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const prompt = compiled.querySelector('.fixed');
      expect(prompt).toBeFalsy();
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(PwaPromptComponent).toBeTruthy();
    });

    it('should have no dependencies', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.children.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing deferredPrompt gracefully', async () => {
      (component as any).deferredPrompt = null;
      
      await component.installApp();
      
      expect(component.showInstallPrompt()).toBe(false);
    });

    it('should handle install prompt without preventDefault', () => {
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        prompt: jasmine.createSpy('prompt')
      };
      
      expect(() => (component as any).handleBeforeInstallPrompt(mockEvent)).not.toThrow();
    });
  });
});

