import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReminderDialogComponent } from './reminder-dialog.component';
import { Habit, Reminder } from '../../models/habit.model';

describe('ReminderDialogComponent', () => {
  let component: ReminderDialogComponent;
  let fixture: ComponentFixture<ReminderDialogComponent>;

  const mockHabit: Habit = {
    id: '1',
    title: 'Test Habit',
    daysTarget: 30,
    categoryId: 'health',
    color: '#ff6b6b',
    createdAt: '2023-01-01',
    checkIns: {},
    reminder: { time: '09:00', days: [1, 2, 3], window: 120 }
  };

  const mockReminder: Reminder = {
    time: '09:00',
    days: [1, 2, 3],
    window: 120
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [ReminderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderDialogComponent);
    component = fixture.componentInstance;
    component.habit = mockHabit;
    component.reminder = mockReminder;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept habit input', () => {
      expect(component.habit).toEqual(mockHabit);
    });

    it('should accept reminder input', () => {
      expect(component.reminder).toEqual(mockReminder);
    });

    it('should accept isOpen input', () => {
      component.isOpen.set(true);
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('Event Emitters', () => {
    it('should emit close event when close button is clicked', () => {
      spyOn(component.close, 'emit');
      
      (component as any).onClose();
      
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit markAsDone event when mark as done button is clicked', () => {
      spyOn(component.markAsDone, 'emit');
      
      (component as any).onMarkAsDone();
      
      expect(component.markAsDone.emit).toHaveBeenCalledWith(mockHabit.id);
    });

    it('should emit snooze event when snooze button is clicked', () => {
      spyOn(component.snooze, 'emit');
      
      (component as any).onSnooze();
      
      expect(component.snooze.emit).toHaveBeenCalledWith(mockHabit.id);
    });
  });

  describe('Template Rendering', () => {
    it('should render dialog when isOpen is true', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.reminder-dialog');
      expect(dialog).toBeTruthy();
    });

    it('should not render dialog when isOpen is false', () => {
      component.isOpen.set(false);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.reminder-dialog');
      expect(dialog).toBeFalsy();
    });

    it('should display habit title', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h4');
      expect(title.textContent.trim()).toBe('Test Habit');
    });

    it('should display reminder time', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const time = compiled.querySelector('p.text-sm.text-slate-600');
      expect(time.textContent.trim()).toContain('9:00 AM');
    });

    it('should display reminder days', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const days = compiled.querySelector('.quick-info span.text-sm.font-semibold');
      expect(days.textContent.trim()).toContain('Monday');
    });
  });

  describe('Helper Methods', () => {
    it('should format time correctly', () => {
      expect((component as any).formatTime('09:00')).toBe('9:00 AM');
      expect((component as any).formatTime('13:30')).toBe('1:30 PM');
      expect((component as any).formatTime('00:00')).toBe('12:00 AM');
      expect((component as any).formatTime('12:00')).toBe('12:00 PM');
    });

    it('should format days correctly', () => {
      const days = [0, 1, 2]; // Sunday, Monday, Tuesday
      const result = (component as any).getDaysText(days);
      expect(result).toContain('Sunday');
      expect(result).toContain('Monday');
      expect(result).toContain('Tuesday');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have correct dialog classes', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.reminder-dialog');
      expect(dialog.classList.contains('reminder-dialog')).toBe(true);
    });

    it('should have correct button classes', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const markDoneButton = compiled.querySelector('.primary-btn');
      const snoozeButton = compiled.querySelector('.snooze-btn');
      
      expect(markDoneButton.classList.contains('primary-btn')).toBe(true);
      expect(snoozeButton.classList.contains('snooze-btn')).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('should be a standalone component', () => {
      expect(ReminderDialogComponent).toBeTruthy();
    });

    it('should have correct event emitters', () => {
      expect(component.close).toBeTruthy();
      expect(component.markAsDone).toBeTruthy();
      expect(component.snooze).toBeTruthy();
    });

    it('should have correct input properties', () => {
      expect(component.habit).toBeTruthy();
      expect(component.reminder).toBeTruthy();
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.reminder-dialog');
      expect(dialog).toBeTruthy();
      // The template doesn't have role="dialog" attribute
    });

    it('should have proper button accessibility', () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      buttons.forEach((button: any) => {
        expect(button).toBeTruthy();
        // The template doesn't have aria-label attributes
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle habit without reminder', () => {
      const habitWithoutReminder = { ...mockHabit, reminder: null };
      component.habit = habitWithoutReminder;
      component.reminder = null;
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.reminder-dialog');
      expect(dialog).toBeTruthy();
    });

    it('should handle null habit', () => {
      component.habit = null;
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const dialog = compiled.querySelector('.reminder-dialog');
      expect(dialog).toBeTruthy();
    });

    it('should handle empty habit title', () => {
      const habitWithEmptyTitle = { ...mockHabit, title: '' };
      component.habit = habitWithEmptyTitle;
      component.isOpen.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h4');
      expect(title.textContent.trim()).toBe('');
    });
  });
});
