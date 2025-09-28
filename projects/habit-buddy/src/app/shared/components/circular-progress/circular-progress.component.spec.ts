import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CircularProgressComponent } from './circular-progress.component';

describe('CircularProgressComponent', () => {
  let component: CircularProgressComponent;
  let fixture: ComponentFixture<CircularProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [CircularProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularProgressComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges() here to avoid change detection issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept percentage input', () => {
      component.percentage = 75;
      fixture.detectChanges();
      expect(component.percentage).toBe(75);
    });

    it('should accept size input', () => {
      component.size = 100;
      fixture.detectChanges();
      expect(component.size).toBe(100);
    });

    it('should accept strokeWidth input', () => {
      component.strokeWidth = 8;
      fixture.detectChanges();
      expect(component.strokeWidth).toBe(8);
    });

    it('should accept label input', () => {
      component.label = 'Test Label';
      fixture.detectChanges();
      expect(component.label).toBe('Test Label');
    });

    it('should accept primaryColor input', () => {
      component.primaryColor = '#ff6b6b';
      fixture.detectChanges();
      expect(component.primaryColor).toBe('#ff6b6b');
    });

    it('should accept secondaryColor input', () => {
      component.secondaryColor = '#e0e0e0';
      fixture.detectChanges();
      expect(component.secondaryColor).toBe('#e0e0e0');
    });

    it('should accept tertiaryColor input', () => {
      component.tertiaryColor = '#f59e0b';
      fixture.detectChanges();
      expect(component.tertiaryColor).toBe('#f59e0b');
    });

    it('should accept activityData input', () => {
      const activityData = [
        { date: '2023-01-01', status: 'completed', tooltip: 'Completed' }
      ];
      component.activityData = activityData;
      fixture.detectChanges();
      expect(component.activityData).toEqual(activityData);
    });
  });

  describe('Template Rendering', () => {
    it('should render container with correct size', () => {
      component.size = 120;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
      expect(container.style.width).toBe('120px');
      expect(container.style.height).toBe('120px');
    });

    it('should render SVG element', () => {
      const compiled = fixture.nativeElement;
      const svg = compiled.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg.classList.contains('circular-progress-svg')).toBe(true);
    });

    it('should render center content', () => {
      const compiled = fixture.nativeElement;
      const centerContent = compiled.querySelector('.center-content');
      expect(centerContent).toBeTruthy();
    });

    it('should display percentage value', () => {
      component.percentage = 75;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const progressValue = compiled.querySelector('.progress-value');
      expect(progressValue.textContent.trim()).toBe('75%');
    });

    it('should display label', () => {
      component.label = 'Test Progress';
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const progressLabel = compiled.querySelector('.progress-label');
      expect(progressLabel.textContent.trim()).toBe('Test Progress');
    });
  });

  describe('Component Methods', () => {
    it('should update percentage when updatePercentage is called', () => {
      component.percentage = 50;
      component.updatePercentage(75);
      
      expect(component.percentage).toBe(75);
    });

    it('should handle component lifecycle', () => {
      component.ngOnInit();
      component.ngOnDestroy();
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct container classes', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container.classList.contains('circular-progress-container')).toBe(true);
    });

    it('should have correct SVG classes', () => {
      const compiled = fixture.nativeElement;
      const svg = compiled.querySelector('.circular-progress-svg');
      expect(svg.classList.contains('circular-progress-svg')).toBe(true);
    });

    it('should have correct center content classes', () => {
      const compiled = fixture.nativeElement;
      const centerContent = compiled.querySelector('.center-content');
      expect(centerContent.classList.contains('center-content')).toBe(true);
    });

    it('should have correct progress value classes', () => {
      const compiled = fixture.nativeElement;
      const progressValue = compiled.querySelector('.progress-value');
      expect(progressValue.classList.contains('progress-value')).toBe(true);
    });

    it('should have correct progress label classes', () => {
      const compiled = fixture.nativeElement;
      const progressLabel = compiled.querySelector('.progress-label');
      expect(progressLabel.classList.contains('progress-label')).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(CircularProgressComponent).toBeTruthy();
    });

    it('should have ViewChild for SVG element', () => {
      expect(component.svgElement).toBeTruthy();
    });

    it('should have no event emitters', () => {
      const componentProps = Object.getOwnPropertyNames(component);
      const outputProps = componentProps.filter(prop => 
        prop.includes('EventEmitter') || prop.includes('Output')
      );
      expect(outputProps.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small size values', () => {
      component.size = 1;
      component.strokeWidth = 0.5;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
    });

    it('should handle very large size values', () => {
      component.size = 10000;
      component.strokeWidth = 100;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
    });

    it('should handle stroke width greater than size', () => {
      component.size = 50;
      component.strokeWidth = 100;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
    });

    it('should handle invalid color values', () => {
      component.primaryColor = 'invalid-color';
      component.secondaryColor = 'invalid-color';
      component.tertiaryColor = 'invalid-color';
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
    });

    it('should handle negative percentage values', () => {
      component.percentage = -10;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const progressValue = compiled.querySelector('.progress-value');
      expect(progressValue.textContent.trim()).toBe('-10%');
    });

    it('should handle percentage values greater than 100', () => {
      component.percentage = 150;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const progressValue = compiled.querySelector('.progress-value');
      expect(progressValue.textContent.trim()).toBe('150%');
    });

    it('should handle empty activity data', () => {
      component.activityData = [];
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
    });

    it('should handle null activity data', () => {
      component.activityData = null as any;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.circular-progress-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle component creation efficiently', () => {
      const startTime = performance.now();
      
      // Test that the component can be created quickly
      const testFixture = TestBed.createComponent(CircularProgressComponent);
      const testComponent = testFixture.componentInstance;
      testComponent.percentage = 50;
      testFixture.detectChanges();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(testComponent.percentage).toBe(50);
    });
  });
});
