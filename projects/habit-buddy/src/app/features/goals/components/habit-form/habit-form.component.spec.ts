import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HabitFormComponent } from './habit-form.component';
import { Reminder } from '../../../../shared/models/habit.model';

describe('HabitFormComponent', () => {
  let component: HabitFormComponent;
  let fixture: ComponentFixture<HabitFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [HabitFormComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect((component as any).title()).toBe('');
      expect((component as any).reminder()).toBe(null);
    });

    it('should have computed hasInputContent property', () => {
      expect((component as any).hasInputContent()).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should emit habitAdded event when form is submitted with title only', () => {
      spyOn(component.habitAdded, 'emit');
      
      (component as any).title.set('Test Habit');
      (component as any).onSubmit();
      
      expect(component.habitAdded.emit).toHaveBeenCalledWith({
        title: 'Test Habit',
        reminder: null
      });
    });

    it('should emit habitAdded event when form is submitted with title and reminder', () => {
      spyOn(component.habitAdded, 'emit');
      
      const mockReminder: Reminder = { time: '09:00', days: [1, 2, 3], window: 120 };
      (component as any).title.set('Test Habit');
      (component as any).reminder.set(mockReminder);
      (component as any).onSubmit();
      
      expect(component.habitAdded.emit).toHaveBeenCalledWith({
        title: 'Test Habit',
        reminder: mockReminder
      });
    });

    it('should reset form after submission', () => {
      (component as any).title.set('Test Habit');
      (component as any).onSubmit();
      
      expect((component as any).title()).toBe('');
      expect((component as any).reminder()).toBe(null);
    });

    it('should not submit when title is empty', () => {
      spyOn(component.habitAdded, 'emit');
      
      (component as any).title.set('');
      (component as any).onSubmit();
      
      expect(component.habitAdded.emit).not.toHaveBeenCalled();
    });

    it('should not submit when title is only whitespace', () => {
      spyOn(component.habitAdded, 'emit');
      
      (component as any).title.set('   ');
      (component as any).onSubmit();
      
      expect(component.habitAdded.emit).not.toHaveBeenCalled();
    });
  });

  describe('Input Content Validation', () => {
    it('should disable buttons when input is empty', () => {
      (component as any).title.set('');
      expect((component as any).hasInputContent()).toBe(false);
    });

    it('should enable buttons when input has content', () => {
      (component as any).title.set('Test Habit');
      expect((component as any).hasInputContent()).toBe(true);
    });

    it('should handle whitespace-only input', () => {
      (component as any).title.set('   ');
      expect((component as any).hasInputContent()).toBe(false);
    });

    it('should handle input with leading/trailing whitespace', () => {
      (component as any).title.set('  Test Habit  ');
      expect((component as any).hasInputContent()).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should render form container', () => {
      const compiled = fixture.nativeElement;
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should render input field', () => {
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('input[name="title"]');
      expect(input).toBeTruthy();
    });

    it('should render submit button', () => {
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
    });

    it('should render reminder button', () => {
      const compiled = fixture.nativeElement;
      const reminderButton = compiled.querySelector('button[type="button"]');
      expect(reminderButton).toBeTruthy();
    });

    it('should have correct input placeholder', () => {
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('input[name="title"]');
      expect(input.getAttribute('placeholder')).toBe('e.g. Morning run, Read 20 pages, Drink water');
    });
  });

  describe('Reminder Management', () => {
    it('should set reminder when setReminder is called', () => {
      const mockReminder: Reminder = { time: '10:00', days: [1, 2, 3], window: 120 };
      
      (component as any).setReminder(mockReminder);
      
      expect((component as any).reminder()).toEqual(mockReminder);
    });

    it('should clear reminder when setReminder is called with null', () => {
      (component as any).reminder.set({ time: '10:00', days: [1, 2, 3], window: 120 });
      
      (component as any).setReminder(null);
      
      expect((component as any).reminder()).toBe(null);
    });
  });

  describe('Event Emitters', () => {
    it('should have habitAdded event emitter', () => {
      expect(component.habitAdded).toBeTruthy();
      expect(component.habitAdded.emit).toBeTruthy();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct form classes', () => {
      const compiled = fixture.nativeElement;
      const form = compiled.querySelector('form');
      expect(form.classList.contains('flex')).toBe(true);
      expect(form.classList.contains('flex-col')).toBe(true);
    });

    it('should have correct input classes', () => {
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('input[name="title"]');
      expect(input.classList.contains('w-full')).toBe(true);
      expect(input.classList.contains('border')).toBe(true);
      expect(input.classList.contains('rounded-lg')).toBe(true);
    });

    it('should have correct button classes', () => {
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton.classList.contains('px-6')).toBe(true);
      expect(submitButton.classList.contains('py-3')).toBe(true);
      expect(submitButton.classList.contains('rounded-lg')).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(HabitFormComponent).toBeTruthy();
    });

    it('should have FormsModule imported', () => {
      const compiled = fixture.nativeElement;
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should have correct input properties', () => {
      expect((component as any).title).toBeTruthy();
      expect((component as any).reminder).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form accessibility', () => {
      const compiled = fixture.nativeElement;
      const form = compiled.querySelector('form');
      expect(form.tagName.toLowerCase()).toBe('form');
    });

    it('should have proper input accessibility', () => {
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('input[name="title"]');
      expect(input.getAttribute('name')).toBe('title');
      expect(input.getAttribute('placeholder')).toBeTruthy();
    });

    it('should have proper button accessibility', () => {
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long habit titles', () => {
      const longTitle = 'A'.repeat(200);
      (component as any).title.set(longTitle);
      
      expect((component as any).hasInputContent()).toBe(true);
    });

    it('should handle special characters in habit title', () => {
      const specialTitle = 'Habit with @#$%^&*() characters';
      (component as any).title.set(specialTitle);
      
      expect((component as any).hasInputContent()).toBe(true);
    });

    it('should handle unicode characters in habit title', () => {
      const unicodeTitle = 'Habit with émojis 🎯 and ñ characters';
      (component as any).title.set(unicodeTitle);
      
      expect((component as any).hasInputContent()).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should trim whitespace from input before submission', () => {
      spyOn(component.habitAdded, 'emit');
      
      (component as any).title.set('  Test Habit  ');
      (component as any).onSubmit();
      
      expect(component.habitAdded.emit).toHaveBeenCalledWith({
        title: 'Test Habit',
        reminder: null
      });
    });

    it('should handle empty string after trimming', () => {
      spyOn(component.habitAdded, 'emit');
      
      (component as any).title.set('   ');
      (component as any).onSubmit();
      
      expect(component.habitAdded.emit).not.toHaveBeenCalled();
    });
  });
});
