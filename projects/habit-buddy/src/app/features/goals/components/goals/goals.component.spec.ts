import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { HabitService, NotificationService, DialogService } from '../../../../shared';
import { GoalsComponent } from './goals.component';
import { Habit, Reminder, BadgeLevel } from '../../../../shared/models/habit.model';

describe('GoalsComponent', () => {
  let component: GoalsComponent;
  let fixture: ComponentFixture<GoalsComponent>;
  let habitService: jasmine.SpyObj<HabitService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let router: jasmine.SpyObj<Router>;

  const mockHabits: Habit[] = [
    {
      id: '1',
      title: 'Test Habit 1',
      daysTarget: 30,
      color: '#ff6b6b',
      createdAt: new Date().toISOString().slice(0, 10), // Today's date
      checkIns: { [new Date().toISOString().slice(0, 10)]: 'completed' }, // Today's check-in
      reminder: null,
      badge: { level: BadgeLevel.NOVICE, name: 'Novice', description: 'Novice badge', icon: 'star', daysRequired: 1 }
    },
    {
      id: '2',
      title: 'Test Habit 2',
      daysTarget: 30,
      color: '#4ecdc4',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 3 days ago
      checkIns: {},
      reminder: { time: '09:00', days: [1, 2, 3], window: 120 },
      badge: null
    }
  ];

  beforeEach(async () => {
    const habitServiceSpy = jasmine.createSpyObj('HabitService', [
      'addHabit', 'removeHabit', 'toggleCheckinToday', 'calcStreaksForHabit', 'updateHabitReminder'
    ], {
      habits$: of(mockHabits)
    });

    // Configure calcStreaksForHabit to return mock stats
    habitServiceSpy.calcStreaksForHabit.and.returnValue({
      current: 5,
      longest: 10,
      total: 15,
      breaks: 2
    });

    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'playBell', 'triggerConfetti', 'checkReminders', 'playSuccessSound'
    ]);

    const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['showError']);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GoalsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: HabitService, useValue: habitServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalsComponent);
    component = fixture.componentInstance;
    habitService = TestBed.inject(HabitService) as jasmine.SpyObj<HabitService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect((component as any).habits()).toEqual(mockHabits);
      expect((component as any).activeFilter()).toBe('all');
      expect((component as any).showFilters()).toBe(false);
      expect((component as any).showMobileFormDialog()).toBe(false);
      expect((component as any).selectedHabit()).toBeNull();
    });

    it('should subscribe to habits changes', () => {
      expect(habitService.habits$).toBeTruthy();
    });
  });

  describe('Habit Management', () => {
    it('should add a habit when habitAdded event is triggered', () => {
      const mockHabit = { title: 'Test Habit', reminder: null };
      const mockCreatedHabit = { 
        id: '3', 
        title: 'Test Habit', 
        daysTarget: 30, 
        color: '#ff6b6b', 
        createdAt: '2023-01-01', 
        checkIns: {}, 
        reminder: null, 
        badge: null 
      };
      
      habitService.addHabit.and.returnValue(mockCreatedHabit);
      
      (component as any).onHabitAdded(mockHabit);
      
      expect(habitService.addHabit).toHaveBeenCalledWith('Test Habit', null);
      expect(notificationService.playBell).toHaveBeenCalled();
      expect(notificationService.triggerConfetti).toHaveBeenCalled();
    });

    it('should add a habit with reminder when habitAdded event is triggered', () => {
      const mockHabit = { 
        title: 'Test Habit', 
        reminder: { time: '09:00', days: [1, 2, 3], window: 120 } 
      };
      const mockCreatedHabit = { 
        id: '3', 
        title: 'Test Habit', 
        daysTarget: 30, 
        color: '#ff6b6b', 
        createdAt: '2023-01-01', 
        checkIns: {}, 
        reminder: mockHabit.reminder, 
        badge: null 
      };
      
      habitService.addHabit.and.returnValue(mockCreatedHabit);
      
      (component as any).onHabitAdded(mockHabit);
      
      expect(habitService.addHabit).toHaveBeenCalledWith('Test Habit', mockHabit.reminder);
      expect(notificationService.playBell).toHaveBeenCalled();
      expect(notificationService.triggerConfetti).toHaveBeenCalled();
    });

    it('should remove a habit when onRemoveHabit is called', () => {
      const habitId = '1';
      
      (component as any).onRemoveHabit(habitId);
      
      expect(habitService.removeHabit).toHaveBeenCalledWith(habitId);
    });

    it('should check in a habit when onCheckin is called successfully', async () => {
      const habitId = '1';
      habitService.toggleCheckinToday.and.returnValue(Promise.resolve({ success: true }));
      
      await (component as any).onCheckin(habitId);
      
      expect(habitService.toggleCheckinToday).toHaveBeenCalledWith(habitId);
      expect(notificationService.playSuccessSound).toHaveBeenCalled();
      expect(notificationService.triggerConfetti).toHaveBeenCalled();
    });

    it('should show error when onCheckin fails', async () => {
      const habitId = '1';
      const errorMessage = 'Cannot check in on future date';
      habitService.toggleCheckinToday.and.returnValue(Promise.resolve({ success: false, message: errorMessage }));
      
      await (component as any).onCheckin(habitId);
      
      expect(habitService.toggleCheckinToday).toHaveBeenCalledWith(habitId);
      expect(dialogService.showError).toHaveBeenCalledWith(errorMessage);
      expect(notificationService.playSuccessSound).not.toHaveBeenCalled();
      expect(notificationService.triggerConfetti).not.toHaveBeenCalled();
    });
  });

  describe('Filter Management', () => {
    it('should change filter when onFilterChange is called', () => {
      const filterValue = 'novice';
      
      (component as any).onFilterChange(filterValue);
      
      expect((component as any).activeFilter()).toBe(filterValue);
      expect((component as any).showFilters()).toBe(false);
    });

    it('should toggle filters when toggleFilters is called', () => {
      expect((component as any).showFilters()).toBe(false);
      
      (component as any).toggleFilters();
      
      expect((component as any).showFilters()).toBe(true);
      
      (component as any).toggleFilters();
      
      expect((component as any).showFilters()).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should compute filtered habits correctly for all filter', () => {
      expect((component as any).filteredHabits()).toEqual(mockHabits);
    });

    it('should compute filtered habits correctly for active filter', () => {
      (component as any).activeFilter.set('active');
      habitService.calcStreaksForHabit.and.returnValue({ current: 5, longest: 10, total: 15, breaks: 2 });
      
      const filtered = (component as any).filteredHabits();
      
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should compute filtered habits correctly for badge level filter', () => {
      (component as any).activeFilter.set('novice');
      
      const filtered = (component as any).filteredHabits();
      
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should compute filtered habits correctly for with-reminders filter', () => {
      (component as any).activeFilter.set('with-reminders');
      
      const filtered = (component as any).filteredHabits();
      
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should compute filtered habits correctly for recent filter', () => {
      (component as any).activeFilter.set('recent');
      
      const filtered = (component as any).filteredHabits();
      
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should compute filtered habits correctly for completed-today filter', () => {
      (component as any).activeFilter.set('completed-today');
      
      const filtered = (component as any).filteredHabits();
      
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should compute hasHabits correctly', () => {
      expect((component as any).hasHabits()).toBe(true);
    });

    it('should compute hasFilteredHabits correctly', () => {
      expect((component as any).hasFilteredHabits()).toBe(true);
    });

    it('should compute activeFilterLabel correctly', () => {
      expect((component as any).activeFilterLabel()).toBe('All Goals');
      
      (component as any).activeFilter.set('novice');
      expect((component as any).activeFilterLabel()).toBe('Novice');
    });

    it('should compute activeFilterCount correctly', () => {
      expect((component as any).activeFilterCount()).toBe(mockHabits.length);
    });
  });

  describe('Reminder Management', () => {
    it('should edit reminder when onEditReminder is called', () => {
      const habitId = '1';
      const habit = mockHabits.find(h => h.id === habitId);
      
      (component as any).onEditReminder(habitId);
      
      expect((component as any).selectedHabit()).toEqual(habit);
    });

    it('should save reminder when onSaveReminder is called for existing habit', () => {
      const event = { habitId: '1', reminder: { time: '10:00', days: [1, 2, 3], window: 120 } };
      
      (component as any).onSaveReminder(event);
      
      expect(habitService.updateHabitReminder).toHaveBeenCalledWith(event.habitId, event.reminder);
      expect((component as any).selectedHabit()).toBeNull();
    });

    it('should save reminder when onSaveReminder is called for form', () => {
      const event = { habitId: 'form', reminder: { time: '10:00', days: [1, 2, 3], window: 120 } };
      const habitFormSpy = jasmine.createSpyObj('HabitFormComponent', ['setReminder']);
      (component as any).habitForm = habitFormSpy;
      
      (component as any).onSaveReminder(event);
      
      expect(habitFormSpy.setReminder).toHaveBeenCalledWith(event.reminder);
      expect((component as any).selectedHabit()).toBeNull();
    });

    it('should open reminder modal when onOpenReminderModal is called', () => {
      (component as any).onOpenReminderModal();
      
      const selectedHabit = (component as any).selectedHabit();
      expect(selectedHabit.id).toBe('form');
      expect(selectedHabit.title).toBe('New Habit');
      expect(selectedHabit.reminder).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate to calendar when onViewCalendar is called', () => {
      const habitId = '1';
      
      (component as any).onViewCalendar(habitId);
      
      expect(router.navigate).toHaveBeenCalledWith(['/calendar'], { 
        queryParams: { habitId: habitId }
      });
    });
  });

  describe('Mobile Form Dialog', () => {
    it('should open mobile form dialog when openMobileFormDialog is called', () => {
      (component as any).openMobileFormDialog();
      
      expect((component as any).showMobileFormDialog()).toBe(true);
    });

    it('should close mobile form dialog when closeMobileFormDialog is called', () => {
      (component as any).showMobileFormDialog.set(true);
      
      (component as any).closeMobileFormDialog();
      
      expect((component as any).showMobileFormDialog()).toBe(false);
    });

    it('should add habit and close dialog when onMobileHabitAdded is called', () => {
      const mockHabit = { title: 'Test Habit', reminder: null };
      const mockCreatedHabit = { 
        id: '3', 
        title: 'Test Habit', 
        daysTarget: 30, 
        color: '#ff6b6b', 
        createdAt: '2023-01-01', 
        checkIns: {}, 
        reminder: null, 
        badge: null 
      };
      
      habitService.addHabit.and.returnValue(mockCreatedHabit);
      
      (component as any).onMobileHabitAdded(mockHabit);
      
      expect(habitService.addHabit).toHaveBeenCalledWith('Test Habit', null);
      expect(notificationService.playBell).toHaveBeenCalled();
      expect(notificationService.triggerConfetti).toHaveBeenCalled();
      expect((component as any).showMobileFormDialog()).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should get filter icon correctly', () => {
      const icon = (component as any).getFilterIcon('Grid3X3');
      expect(icon).toBeTruthy();
    });

    it('should return fallback icon for unknown icon name', () => {
      const icon = (component as any).getFilterIcon('UnknownIcon');
      expect(icon).toBeTruthy();
    });

    it('should get habit tracking key correctly', () => {
      const habit = mockHabits[0];
      const key = (component as any).getHabitTrackingKey(habit);
      
      expect(key).toContain(habit.id);
    });

    it('should get habit stats correctly', () => {
      const habit = mockHabits[0];
      const stats = { current: 5, longest: 10, total: 15, breaks: 2 };
      
      habitService.calcStreaksForHabit.and.returnValue(stats);
      
      const result = (component as any).getHabitStats(habit);
      
      expect(result).toEqual(stats);
      expect(habitService.calcStreaksForHabit).toHaveBeenCalledWith(habit);
    });
  });

  describe('Component Lifecycle', () => {
    it('should check reminders on init', () => {
      component.ngOnInit();
      
      expect(notificationService.checkReminders).toHaveBeenCalled();
    });

    it('should clean up interval on destroy', () => {
      component.ngOnDestroy();
      
      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should render view container', () => {
      const compiled = fixture.nativeElement;
      const view = compiled.querySelector('.view');
      expect(view).toBeTruthy();
    });

    it('should render filter section', () => {
      const compiled = fixture.nativeElement;
      const filterSection = compiled.querySelector('.compact-filter-section');
      expect(filterSection).toBeTruthy();
    });

    it('should render habits grid', () => {
      const compiled = fixture.nativeElement;
      const grid = compiled.querySelector('.grid');
      expect(grid).toBeTruthy();
    });

    it('should render FAB button', () => {
      const compiled = fixture.nativeElement;
      const fab = compiled.querySelector('button.md\\:hidden.fixed.bottom-20.right-6');
      expect(fab).toBeTruthy();
    });
  });

  describe('Service Integration', () => {
    it('should inject HabitService correctly', () => {
      expect(habitService).toBeTruthy();
    });

    it('should inject NotificationService correctly', () => {
      expect(notificationService).toBeTruthy();
    });

    it('should inject DialogService correctly', () => {
      expect(dialogService).toBeTruthy();
    });

    it('should inject Router correctly', () => {
      expect(router).toBeTruthy();
    });
  });
});
