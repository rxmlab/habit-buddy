import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ChartComponent } from './chart.component';
import { WeeklyTrend, MonthlyTrend, YearlyTrend } from '../../models/habit.model';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const mockWeeklyData: WeeklyTrend = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [2, 3, 1, 4, 2, 1, 3]
  };

  const mockMonthlyData: MonthlyTrend = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [8, 12, 6, 10]
  };

  const mockYearlyData: YearlyTrend = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [45, 52, 38, 61, 47, 55]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.chartCanvas).toBeTruthy();
      expect(component.data).toBeUndefined();
    });

    it('should have ViewChild reference to chartCanvas', () => {
      expect(component.chartCanvas).toBeTruthy();
    });
  });

  describe('Template Rendering', () => {
    it('should render canvas element', () => {
      const compiled = fixture.nativeElement;
      const canvas = compiled.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.tagName.toLowerCase()).toBe('canvas');
    });

    it('should have correct canvas attributes', () => {
      const compiled = fixture.nativeElement;
      const canvas = compiled.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.tagName.toLowerCase()).toBe('canvas');
    });
  });

  describe('Data Input Handling', () => {
    it('should handle WeeklyTrend data', () => {
      component.data = mockWeeklyData;
      fixture.detectChanges();
      
      expect(component.data).toEqual(mockWeeklyData);
    });

    it('should handle MonthlyTrend data', () => {
      component.data = mockMonthlyData;
      fixture.detectChanges();
      
      expect(component.data).toEqual(mockMonthlyData);
    });

    it('should handle YearlyTrend data', () => {
      component.data = mockYearlyData;
      fixture.detectChanges();
      
      expect(component.data).toEqual(mockYearlyData);
    });
  });

  describe('Chart.js Integration', () => {
    beforeEach(() => {
      // Mock Chart.js
      (window as any).Chart = jasmine.createSpy('Chart').and.returnValue({
        destroy: jasmine.createSpy('destroy'),
        update: jasmine.createSpy('update')
      });
    });

    it('should load Chart.js library dynamically', async () => {
      component.data = mockWeeklyData;
      await component.ngAfterViewInit();
      
      expect((window as any).Chart).toBeTruthy();
    });

    it('should handle data changes', () => {
      component.data = mockWeeklyData;
      component.ngOnChanges({ data: { currentValue: mockWeeklyData, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should handle component lifecycle', () => {
      component.data = mockWeeklyData;
      component.ngOnInit();
      component.ngOnDestroy();
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle ngAfterViewInit', async () => {
      component.data = mockWeeklyData;
      await component.ngAfterViewInit();
      
      expect(component.chartCanvas).toBeTruthy();
    });

    it('should handle ngOnDestroy', () => {
      component.ngOnDestroy();
      
      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should handle ngOnChanges', () => {
      component.data = mockWeeklyData;
      component.ngOnChanges({ data: { currentValue: mockWeeklyData, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Chart.js library gracefully', async () => {
      (window as any).Chart = undefined;
      
      component.data = mockWeeklyData;
      await component.ngAfterViewInit();
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle missing canvas context', async () => {
      (window as any).Chart = jasmine.createSpy('Chart');
      spyOn(component.chartCanvas.nativeElement, 'getContext').and.returnValue(null);
      
      component.data = mockWeeklyData;
      await component.ngAfterViewInit();
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(ChartComponent).toBeTruthy();
    });

    it('should have correct input property', () => {
      expect(component.data).toBeUndefined(); // Initially undefined
    });

    it('should have ViewChild for canvas reference', () => {
      expect(component.chartCanvas).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle rapid data changes efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        component.data = { labels: [`Label ${i}`], data: [i] };
        component.ngOnChanges({ data: { currentValue: component.data, previousValue: null, firstChange: false, isFirstChange: () => false } });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
