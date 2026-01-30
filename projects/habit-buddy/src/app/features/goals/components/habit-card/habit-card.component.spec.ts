import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HabitCardComponent } from './habit-card.component';
import { Habit, HabitStats, Badge } from '../../../../shared/models/habit.model';
import { BadgeService } from '../../../../shared/services/badge.service';
import { By } from '@angular/platform-browser';

describe('HabitCardComponent', () => {
  let component: HabitCardComponent;
  let fixture: ComponentFixture<HabitCardComponent>;
  let badgeServiceSpy: jasmine.SpyObj<BadgeService>;

  const mockBadge: Badge = {
    id: 1,
    slug: 'novice',
    name: 'Novice',
    description: 'First Steps',
    icon: 'Sparkles',
    daysRequired: 1
  };

  const mockHabit: Habit = {
    id: '1',
    title: 'Test Habit',
    daysTarget: 21,
    color: '#ff6b6b',
    createdAt: Date.now(),
    checkIns: [],
    badgeId: 1,
    currentStreak: 5,
    reminder: { time: '09:00', days: [1, 2, 3], window: 120 }
  };

  const mockStats: HabitStats = {
    current: 5,
    longest: 10,
    total: 15,
    breaks: 2
  };

  beforeEach(async () => {
    badgeServiceSpy = jasmine.createSpyObj('BadgeService', ['getBadge', 'getBadgeForDays', 'getBadgeColors', 'getProgressToNextBadge']);

    // Default mock returns
    badgeServiceSpy.getBadge.and.returnValue(mockBadge);
    badgeServiceSpy.getBadgeForDays.and.returnValue(mockBadge);
    badgeServiceSpy.getBadgeColors.and.returnValue({
      background: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    });
    badgeServiceSpy.getProgressToNextBadge.and.returnValue(50);

    await TestBed.configureTestingModule({
      imports: [HabitCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BadgeService, useValue: badgeServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HabitCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('habit', mockHabit);
    fixture.componentRef.setInput('stats', mockStats);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept habit input', () => {
      expect(component.habit()).toEqual(mockHabit);
    });

    it('should accept stats input', () => {
      expect(component.stats()).toEqual(mockStats);
    });
  });

  describe('Computed Properties', () => {
    it('should calculate daysSinceStart correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const habitStartYesterday = { ...mockHabit, createdAt: yesterday.getTime() };
      fixture.componentRef.setInput('habit', habitStartYesterday);
      fixture.detectChanges();

      // Yesterday and Today = 2 days
      expect(component['daysSinceStart']()).toBe(2);
    });

    it('should return 1 day if created today', () => {
      const today = new Date();
      const habitStartToday = { ...mockHabit, createdAt: today.getTime() };
      fixture.componentRef.setInput('habit', habitStartToday);
      fixture.detectChanges();

      expect(component['daysSinceStart']()).toBe(1);
    });

    it('should determine isCheckedToday correctly', () => {
      // No check-ins
      expect(component['isCheckedToday']()).toBeFalse();

      // Check-in today
      const habitCheckedIn = {
        ...mockHabit,
        checkIns: [{
          id: 'c1',
          habitId: '1',
          checkInDate: Date.now(),
          status: 'completed' as const,
          createdAt: Date.now()
        }]
      };
      fixture.componentRef.setInput('habit', habitCheckedIn);
      fixture.detectChanges();

      expect(component['isCheckedToday']()).toBeTrue();
    });
  });

  describe('Badge Logic', () => {
    it('should use BadgeService to get badge level text', () => {
      const text = component['badgeLevelText']();
      expect(badgeServiceSpy.getBadgeForDays).toHaveBeenCalled();
      expect(text).toBe('Novice');
    });

    it('should get badge styling from service', () => {
      const classes = component['getBadgeClasses']();
      expect(badgeServiceSpy.getBadge).toHaveBeenCalledWith(1); // habit.badgeId is 1
      expect(classes).toContain('bg-yellow-100');
    });
  });

  describe('Template Rendering', () => {
    it('should display habit title', () => {
      const element = fixture.debugElement.query(By.css('.habit-title')).nativeElement;
      expect(element.textContent).toContain('Test Habit');
    });

    it('should display current streak from habit property', () => {
      const element = fixture.debugElement.query(By.css('.streak-value')).nativeElement;
      expect(element.textContent).toContain('5');
    });

    it('should display total days', () => {
      const element = fixture.debugElement.query(By.css('.stat-item .stat-value')).nativeElement;
      // daysSinceStart is 1 for default mock (created now)
      expect(element.textContent).toContain('1');
    });
  });

  describe('Event Emitters', () => {
    it('should emit checkin', () => {
      spyOn(component.checkin, 'emit');
      const btn = fixture.debugElement.query(By.css('.check-in-btn'));
      btn.nativeElement.click();
      expect(component.checkin.emit).toHaveBeenCalled();
    });

    it('should NOT emit checkin if already checked in', () => {
      const habitCheckedIn = {
        ...mockHabit,
        checkIns: [{
          id: 'c1',
          habitId: '1',
          checkInDate: Date.now(),
          status: 'completed' as const,
          createdAt: Date.now()
        }]
      };
      fixture.componentRef.setInput('habit', habitCheckedIn);
      fixture.detectChanges();

      spyOn(component.checkin, 'emit');
      const btn = fixture.debugElement.query(By.css('.check-in-btn'));
      // Button is disabled/styled differently but click might still fire in test if not carefully guarded, 
      // but component logic guards it
      component['onCheckin']();
      expect(component.checkin.emit).not.toHaveBeenCalled();
    });

    it('should show delete dialog on remove click', () => {
      const removeBtn = fixture.debugElement.query(By.css('button[data-tooltip="Remove habit"]'));
      removeBtn.nativeElement.click();
      fixture.detectChanges();

      const dialog = fixture.debugElement.query(By.css('app-dialog'));
      expect(dialog).toBeTruthy();
      expect(component['showDeleteDialog']()).toBeTrue();
    });
  });

  describe('Status Messages', () => {
    it('should show "On fire" if checked in today', () => {
      const habitCheckedIn = {
        ...mockHabit,
        checkIns: [{ id: 'c1', habitId: '1', checkInDate: Date.now(), status: 'completed' as const, createdAt: Date.now() }]
      };
      fixture.componentRef.setInput('habit', habitCheckedIn);
      fixture.detectChanges();

      expect(component['motivationalMessage']()).toContain('fire');
    });

    it('should show "Keep the streak alive" for high streak', () => {
      const highStreakHabit = { ...mockHabit, currentStreak: 10 };
      fixture.componentRef.setInput('habit', highStreakHabit);
      fixture.detectChanges();

      expect(component['motivationalMessage']()).toBe('Keep the streak alive!');
    });
  });
});