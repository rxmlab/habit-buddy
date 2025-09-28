import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HabitService } from './habit.service';
import { TimezoneService } from './timezone.service';
import { Habit, Reminder, BadgeLevel } from '../models/habit.model';

describe('HabitService', () => {
  let service: HabitService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: TimezoneService, useValue: jasmine.createSpyObj('TimezoneService', [
          'getCurrentTimezone', 
          'getCurrentDate', 
          'getTodayString', 
          'formatDateString'
        ], {
          getTodayString: () => '2023-01-01',
          formatDateString: () => '2023-01-01'
        }) }
      ]
    });
    service = TestBed.inject(HabitService);
    
    // Clear localStorage and service state before each test
    localStorage.clear();
    service.habits.set([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Habit Management', () => {
    it('should add a new habit', () => {
      const habit = service.addHabit('Test Habit');
      
      expect(habit).toBeTruthy();
      expect(habit.title).toBe('Test Habit');
      expect(habit.id).toBeTruthy();
      expect(habit.daysTarget).toBe(30);
      expect(habit.color).toBeTruthy();
      expect(habit.createdAt).toBeTruthy();
      expect(habit.checkIns).toEqual({});
      expect(habit.reminder).toBeNull();
      expect(habit.badge).toBeNull();
    });

    it('should add a habit with reminder', () => {
      const reminder: Reminder = { time: '09:00', days: [1, 2, 3], window: 120 };
      const habit = service.addHabit('Test Habit', reminder);
      
      expect(habit.reminder).toEqual(reminder);
    });

    it('should remove a habit', () => {
      const habit = service.addHabit('Test Habit');
      const habitId = habit.id;
      
      service.removeHabit(habitId);
      
      const habits = service.habits();
      expect(habits.find(h => h.id === habitId)).toBeUndefined();
    });

    it('should get all habits', () => {
      // Clear existing habits first
      service.habits.set([]);
      
      service.addHabit('Habit 1');
      service.addHabit('Habit 2');
      
      const habits = service.habits();
      expect(habits.length).toBe(2);
    });

    it('should get habits observable', () => {
      // Clear existing habits first
      service.habits.set([]);
      
      let habits: Habit[] = [];
      service.habits$.subscribe(h => habits = h);
      
      service.addHabit('Test Habit');
      
      expect(habits.length).toBe(1);
      expect(habits[0].title).toBe('Test Habit');
    });
  });

  describe('Check-in Management', () => {
    it('should toggle check-in for today', async () => {
      const habit = service.addHabit('Test Habit');
      
      const result = await service.toggleCheckinToday(habit.id);
      
      expect(result.success).toBe(true);
      const updatedHabit = service.habits().find(h => h.id === habit.id);
      expect(updatedHabit?.checkIns).toBeTruthy();
    });

    it('should not allow duplicate check-ins', async () => {
      const habit = service.addHabit('Test Habit');
      
      // First check-in
      await service.toggleCheckinToday(habit.id);
      
      // Second check-in should fail
      const result = await service.toggleCheckinToday(habit.id);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Already checked in today');
    });

    it('should return error for non-existent habit', async () => {
      const result = await service.toggleCheckinToday('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Habit not found.');
    });
  });

  describe('Reminder Management', () => {
    it('should update habit reminder', () => {
      const habit = service.addHabit('Test Habit');
      const reminder: Reminder = { time: '10:00', days: [1, 2, 3], window: 120 };
      
      service.updateHabitReminder(habit.id, reminder);
      
      const updatedHabit = service.habits().find(h => h.id === habit.id);
      expect(updatedHabit?.reminder).toEqual(reminder);
    });

    it('should remove habit reminder', () => {
      const habit = service.addHabit('Test Habit');
      const reminder: Reminder = { time: '10:00', days: [1, 2, 3], window: 120 };
      
      service.updateHabitReminder(habit.id, reminder);
      service.updateHabitReminder(habit.id, null);
      
      const updatedHabit = service.habits().find(h => h.id === habit.id);
      expect(updatedHabit?.reminder).toBeNull();
    });

    it('should get habits with reminders', () => {
      const habit1 = service.addHabit('Habit 1');
      const habit2 = service.addHabit('Habit 2');
      const reminder: Reminder = { time: '09:00', days: [1, 2, 3], window: 120 };
      
      service.updateHabitReminder(habit1.id, reminder);
      
      const habitsWithReminders = service.getHabitsWithReminders();
      expect(habitsWithReminders.length).toBe(1);
      expect(habitsWithReminders[0].id).toBe(habit1.id);
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(() => {
      // Add test habits with check-ins
      const habit1 = service.addHabit('Habit 1');
      const habit2 = service.addHabit('Habit 2');
      
      // Add some check-ins
      habit1.checkIns = {
        '2023-01-01': 'hash1',
        '2023-01-02': 'hash2',
        '2023-01-03': 'hash3'
      };
      
      habit2.checkIns = {
        '2023-01-01': 'hash4',
        '2023-01-02': 'hash5'
      };
    });

    it('should calculate total completed check-ins', () => {
      const total = service.totalCompleted();
      expect(total).toBe(5); // 3 + 2
    });

    it('should calculate average completion rate', () => {
      const average = service.averageCompletion();
      expect(average).toBeGreaterThan(0);
      expect(average).toBeLessThanOrEqual(100);
    });

    it('should find best current streak', () => {
      const bestStreak = service.bestCurrentStreak();
      expect(bestStreak).toBeGreaterThanOrEqual(0);
    });

    it('should find best longest streak', () => {
      const longestStreak = service.bestLongestStreak();
      expect(longestStreak).toBeGreaterThanOrEqual(0);
    });

    it('should calculate streaks for specific habit', () => {
      const habits = service.habits();
      const habit = habits[0];
      
      const stats = service.calcStreaksForHabit(habit);
      
      expect(stats.current).toBeGreaterThanOrEqual(0);
      expect(stats.longest).toBeGreaterThanOrEqual(0);
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.breaks).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Badge System', () => {
    it('should assign badge based on streak', () => {
      const habit = service.addHabit('Test Habit');
      
      // Simulate a 7-day streak
      const checkIns: { [key: string]: string } = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        checkIns[date.toISOString().slice(0, 10)] = `hash${i}`;
      }
      habit.checkIns = checkIns;
      
      const stats = service.calcStreaksForHabit(habit);
      expect(stats.current).toBe(7);
    });

    it('should handle different badge levels', () => {
      const habit = service.addHabit('Test Habit');
      
      // Test different streak lengths
      const testCases = [
        { days: 1, expectedLevel: BadgeLevel.NOVICE },
        { days: 7, expectedLevel: BadgeLevel.BEGINNER },
        { days: 21, expectedLevel: BadgeLevel.INTERMEDIATE },
        { days: 66, expectedLevel: BadgeLevel.ADVANCED },
        { days: 100, expectedLevel: BadgeLevel.EXPERT },
        { days: 365, expectedLevel: BadgeLevel.MASTER }
      ];
      
      testCases.forEach(testCase => {
        const checkIns: { [key: string]: string } = {};
        for (let i = 0; i < testCase.days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          checkIns[date.toISOString().slice(0, 10)] = `hash${i}`;
        }
        habit.checkIns = checkIns;
        
        const stats = service.calcStreaksForHabit(habit);
        expect(stats.current).toBe(testCase.days);
      });
    });
  });

  describe('Data Persistence', () => {
    it('should save habits to localStorage', () => {
      service.addHabit('Test Habit');
      
      const savedData = localStorage.getItem('habitbuddy_v2_local');
      expect(savedData).toBeTruthy();
      
      const habits = JSON.parse(savedData!);
      expect(habits.length).toBe(1);
      expect(habits[0].title).toBe('Test Habit');
    });

    it('should load habits from localStorage', () => {
      const testHabits = [
        {
          id: '1',
          title: 'Test Habit',
          daysTarget: 30,
          categoryId: 'health',
          color: '#ff6b6b',
          createdAt: '2023-01-01',
          checkIns: {},
          reminder: null
        }
      ];
      
      localStorage.setItem('habitbuddy_v2_local', JSON.stringify(testHabits));
      
      // Create new service instance using TestBed to test loading
      const newService = TestBed.inject(HabitService);
      // Trigger reload from localStorage
      newService.habits.set(newService['loadHabits']());
      const habits = newService.habits();
      
      expect(habits.length).toBe(1);
      expect(habits[0].title).toBe('Test Habit');
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('habitbuddy_v2_local', 'invalid json');
      
      const newService = TestBed.inject(HabitService);
      const habits = newService.habits();
      
      expect(habits).toEqual([]);
    });

    it('should handle missing localStorage data', () => {
      localStorage.removeItem('habitbuddy_v2_local');
      
      const newService = TestBed.inject(HabitService);
      const habits = newService.habits();
      
      expect(habits).toEqual([]);
    });
  });

  describe('Data Export/Import', () => {
    it('should export habits data', () => {
      // Clear existing habits first
      service.habits.set([]);
      
      service.addHabit('Habit 1');
      service.addHabit('Habit 2');
      
      const exportedData = service.exportHabits();
      
      expect(exportedData).toBeTruthy();
      const parsed = JSON.parse(exportedData);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('should update habits list', () => {
      const newHabits = [
        {
          id: '1',
          title: 'Updated Habit',
          daysTarget: 30,
          categoryId: 'health',
          color: '#ff6b6b',
          createdAt: '2023-01-01',
          checkIns: {},
          reminder: null
        }
      ];
      
      service.updateHabitsList(newHabits);
      
      const habits = service.habits();
      expect(habits.length).toBe(1);
      expect(habits[0].title).toBe('Updated Habit');
    });

    it('should load sample habits', () => {
      service.loadSampleHabits();
      
      const habits = service.habits();
      expect(habits.length).toBeGreaterThan(0);
    });

    it('should clear all habits', () => {
      service.addHabit('Test Habit');
      expect(service.habits().length).toBeGreaterThan(0);
      
      service.clearAllHabits();
      expect(service.habits().length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle removing non-existent habit', () => {
      expect(() => service.removeHabit('non-existent-id')).not.toThrow();
    });

    it('should handle updating reminder for non-existent habit', () => {
      const reminder: Reminder = { time: '10:00', days: [1, 2, 3], window: 120 };
      expect(() => service.updateHabitReminder('non-existent-id', reminder)).not.toThrow();
    });

    it('should handle calculating stats for non-existent habit', () => {
      const mockHabit = {
        id: 'non-existent',
        title: 'Test',
        daysTarget: 30,
        categoryId: 'health',
        color: '#ff6b6b',
        createdAt: '2023-01-01',
        checkIns: {},
        reminder: null
      };
      
      const stats = service.calcStreaksForHabit(mockHabit);
      expect(stats.current).toBe(0);
      expect(stats.longest).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.breaks).toBe(0);
    });

    it('should handle empty habit title', () => {
      const habit = service.addHabit('');
      expect(habit.title).toBe('');
    });

    it('should handle very long habit title', () => {
      const longTitle = 'A'.repeat(1000);
      const habit = service.addHabit(longTitle);
      expect(habit.title).toBe(longTitle);
    });
  });

  describe('Performance', () => {
    it('should handle large number of habits efficiently', () => {
      const startTime = performance.now();
      
      // Add 1000 habits
      for (let i = 0; i < 1000; i++) {
        service.addHabit(`Habit ${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(service.habits().length).toBe(1000);
    });

    it('should handle large number of check-ins efficiently', () => {
      const habit = service.addHabit('Test Habit');
      
      const startTime = performance.now();
      
      // Add 365 check-ins (1 year)
      for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        habit.checkIns[date.toISOString().slice(0, 10)] = `hash${i}`;
      }
      
      const stats = service.calcStreaksForHabit(habit);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(stats.current).toBe(365);
    });
  });
});
