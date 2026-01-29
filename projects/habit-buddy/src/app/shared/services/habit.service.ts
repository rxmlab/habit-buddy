import { computed, inject, Injectable, signal } from '@angular/core';
import { formatDate } from '@angular/common'; // Import formatDate
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getBadgeConfigForDays } from '../config/badge-levels.config';
import { DATE_FORMATS } from '../config/date-formats.config'; // Import DATE_FORMATS
import { Habit, HabitBadge, HabitStats, MonthlyTrend, Reminder, WeeklyTrend, YearlyTrend, CheckIn } from '../models/habit.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AuthUser } from '../interfaces/user.interface';
import { TimezoneService } from './timezone.service';
import { isSameDay, toLocalISODate } from '../utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly COLORS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4d96ff', '#b388eb', '#ffa07a', '#7dd3fc'];
  private readonly DEFAULT_WINDOW_MIN = 120;
  private timezoneService = inject(TimezoneService);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  public habits$ = this.habitsSubject.asObservable();
  public habits = signal(this.habitsSubject.value);

  public totalCompleted = computed(() => 
    this.habits().reduce((sum, habit) => sum + (habit.checkIns?.length || 0), 0)
  );

  public averageCompletion = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const totalCompletion = habits.reduce((sum, habit) => {
      const completed = habit.checkIns?.length || 0;
      return sum + (completed / habit.daysTarget * 100);
    }, 0);
    return Math.round(totalCompletion / habits.length);
  });

  public bestCurrentStreak = computed(() => {
    return Math.max(...this.habits().map(habit => this.calcStreaksForHabit(habit).current), 0);
  });

  public bestLongestStreak = computed(() => {
    return Math.max(...this.habits().map(habit => this.calcStreaksForHabit(habit).longest), 0);
  });

  public weeklyTrend = computed((): WeeklyTrend => {
    const labels: string[] = [];
    const data: number[] = [];
    
    // Last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(formatDate(d, DATE_FORMATS.weekday, 'en-US')); // Use standardized format
      
      const dateStr = d.toISOString().slice(0, 10);
      
      const dayTotal = this.habits().reduce((sum, habit) => {
        if (!habit.checkIns) return sum;
        // Check if any check-in matches this date
        const hasCheckIn = habit.checkIns.some(ci => {
          return new Date(ci.checkInDate).toISOString().slice(0, 10) === dateStr;
        });
        return sum + (hasCheckIn ? 1 : 0);
      }, 0);
      data.push(dayTotal);
    }
    
    return { labels, data };
  });

  public monthlyTrend = computed((): MonthlyTrend => {
    const labels: string[] = [];
    const data: number[] = [];
    
    // Get current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().slice(0, 10);
      labels.push(day.toString());
      
      const dayTotal = this.habits().reduce((sum, habit) => {
        if (!habit.checkIns) return sum;
        const hasCheckIn = habit.checkIns.some(ci => 
          new Date(ci.checkInDate).toISOString().slice(0, 10) === dateStr
        );
        return sum + (hasCheckIn ? 1 : 0);
      }, 0);

      data.push(dayTotal);
    }
    
    return { labels, data };
  });

  public yearlyTrend = computed((): YearlyTrend => {
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(formatDate(d, DATE_FORMATS.monthYear, 'en-US')); // Use standardized format
      
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      let monthTotal = 0;
      for (const habit of this.habits()) {
        if (habit.checkIns) {
          for (const ci of habit.checkIns) {
            const checkInDate = new Date(ci.checkInDate);
            if (checkInDate >= monthStart && checkInDate <= monthEnd) {
              monthTotal++;
            }
          }
        }
      }
      
      data.push(monthTotal);
    }
    
    return { labels, data };
  });

  constructor() {
    this.habits$.subscribe(habits => {
      this.habits.set(habits);
    });

    // Load habits from backend when user authenticates
    this.authService.authUser$.subscribe(async (user: AuthUser | null) => {
      if (user) {
        // Wait a bit to ensure token is cached
        await new Promise(resolve => setTimeout(resolve, 100));
        this.loadHabitsFromBackend();
      } else {
        this.habitsSubject.next([]);
      }
    });
  }

  // Load habits from backend
  refreshHabits(): void {
    this.apiService.getHabits().subscribe({
      next: (habits) => {
        this.habitsSubject.next(habits);
      },
      error: (error) => {
        console.error('Error loading habits from backend:', error);
        this.habitsSubject.next([]);
      }
    });
  }

  private loadHabitsFromBackend(): void {
    this.refreshHabits();
  }

  // Additional methods needed by components
  checkInHabit(habitId: string, date?: string): Observable<any> {
    // Frontend date is optional string YYYY-MM-DD
    // We need to support it if provided, or default to now
    return this.apiService.checkInHabit(habitId, date);
  }

  deleteHabit(id: string): Observable<void> {
    return this.apiService.deleteHabit(id).pipe(
      tap(() => {
        this.loadHabitsFromBackend();
      })
    );
  }

  updateHabit(id: string, habit: Partial<Habit>): Observable<Habit> {
    return this.apiService.updateHabit(id, habit).pipe(
      tap(() => {
        this.loadHabitsFromBackend();
      })
    );
  }

  getHabitsWithReminders(): Habit[] {
    return this.habits().filter(habit => habit.reminder);
  }

  addHabit(title: string, reminder?: Reminder | null): Observable<Habit> {
    const habitData = {
      title: title.trim(),
      daysTarget: 30,
      color: this.pickColor(this.habits().length),
      reminder: reminder || null
    };

    return this.apiService.createHabit(habitData).pipe(
      tap(() => {
        this.loadHabitsFromBackend();
      })
    );
  }

  private getBadgeForProgress(completedDays: number): HabitBadge | null {
    const badgeConfig = getBadgeConfigForDays(completedDays);
    
    return {
      level: badgeConfig.level,
      name: badgeConfig.name,
      description: badgeConfig.description,
      icon: badgeConfig.icon,
      daysRequired: badgeConfig.daysRequired,
      achievedAt: new Date().toISOString() // FE side logic for sample data
    };
  }

  removeHabit(id: string): void {
    const updatedHabits = this.habits().filter(habit => habit.id !== id);
    this.habitsSubject.next(updatedHabits);
  }

  updateHabitReminder(id: string, reminder: Reminder | null): void {
    const updatedHabits = this.habits().map(habit => 
      habit.id === id ? { ...habit, reminder } : habit
    );
    this.habitsSubject.next(updatedHabits);
  }

  async checkInToday(habitId: string): Promise<{ success: boolean; message?: string }> {
    const habit = this.habits().find(h => h.id === habitId);
    if (!habit) {
      return { success: false, message: 'Habit not found.' };
    }

    const todayDate = new Date();
    // Safety check: ensure checkIns is an array
    const checkIns = habit.checkIns || [];
    
    // Check if already checked in
    const todayCheckIn = checkIns.find(ci => isSameDay(ci.checkInDate, todayDate));
    
    if (todayCheckIn) {
      return { success: false, message: 'Already checked in today.' };
    }

    const canCheckIn = this.canCheckIn(habit);
    if (!canCheckIn.ok) {
      return { success: false, message: canCheckIn.msg };
    }

    // Create check-in
    return new Promise((resolve) => {
      this.apiService.checkInHabit(habitId).subscribe({
        next: () => {
           this.loadHabitsFromBackend();
           resolve({ success: true, message: 'Checked in!' });
        },
        error: (err) => {
          resolve({ success: false, message: err.error?.detail || 'Check-in failed' });
        }
      });
    });
  }



  private canCheckIn(habit: Habit): { ok: boolean; msg?: string } {
    // Frontend validation only, backend also validates
    const todayDate = new Date();
    const alreadyCheckedIn = habit.checkIns?.some(ci => isSameDay(ci.checkInDate, todayDate));

    if (alreadyCheckedIn) {
      return { ok: false, msg: 'Already checked in today.' };
    }

    if (habit.reminder) {
      const now = new Date();
      const minsNow = now.getHours() * 60 + now.getMinutes();
      const target = this.hhmmToMins(habit.reminder.time);
      const window = habit.reminder.window ?? this.DEFAULT_WINDOW_MIN;
      const weekday = now.getDay();

      if (!habit.reminder.days.includes(weekday)) {
        return { ok: false, msg: 'Today is not a scheduled reminder day for this habit.' };
      }

      const diff = Math.min(
        Math.abs(minsNow - target),
        24 * 60 - Math.abs(minsNow - target)
      );

      if (diff > window / 2) {
        return { ok: false, msg: `Check-in allowed only within ${Math.round((window / 60) * 100) / 100}h window around reminder.` };
      }
    }

    return { ok: true };
  }

  calcStreaksForHabit(habit: Habit): HabitStats {
     if (!habit.checkIns || habit.checkIns.length === 0) {
        return { current: 0, longest: 0, total: 0, breaks: 0 };
     }

     const dates = habit.checkIns
        .map(ci => toLocalISODate(ci.checkInDate))
        .sort()
        .filter((v, i, a) => a.indexOf(v) === i); // unique

     if (!dates.length) return { current: 0, longest: 0, total: 0, breaks: 0 };

    // Logic similar to stats.py but in JS
    let longest = 0;
    let breaks = 0;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i-1]);
        const curr = new Date(dates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            tempStreak++;
        } else {
            longest = Math.max(longest, tempStreak);
            if (diffDays > 1) {
                breaks++;
            }
            tempStreak = 1;
        }
    }
    longest = Math.max(longest, tempStreak);

    // Current Streak
    let current = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    
    const lastCheckIn = new Date(dates[dates.length - 1]);
    lastCheckIn.setHours(0,0,0,0);

    const diffToToday = Math.round((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));

    if (diffToToday <= 1) {
        // Streak is alive (today or yesterday checked in)
        current = 1;
        for (let i = dates.length - 2; i >= 0; i--) {
            const curr = new Date(dates[i]);
            const next = new Date(dates[i+1]);
            const diff = Math.round((next.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                current++;
            } else {
                break;
            }
        }
    }

    return { current, longest, total: habit.checkIns.length, breaks };
  }

  exportHabits(): string {
    return JSON.stringify(this.habits(), null, 2);
  }

  updateHabitsList(habits: Habit[]): void {
    this.habitsSubject.next(habits);
  }

  loadSampleHabits(): void {
    const sampleHabits = this.createSampleHabits();
    this.habitsSubject.next(sampleHabits);
  }

  clearAllHabits(): void {
    this.habitsSubject.next([]);
  }

  private createSampleHabits(): Habit[] {
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const generateCheckIns = (habitIndex: number, creationDate: number): CheckIn[] => {
      const checkIns: CheckIn[] = [];
      const startDate = new Date(creationDate);
      const totalDays = Math.floor((new Date().getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      
      for (let dayOffset = 0; dayOffset <= totalDays; dayOffset++) {
        const date = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay();
        
        let shouldCheckIn = false;
        switch (habitIndex) {
          case 0: shouldCheckIn = Math.random() < 0.8; break;
          case 1: shouldCheckIn = dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() < 0.7; break;
          case 2: shouldCheckIn = dayOffset % 2 === 0 && Math.random() < 0.6; break;
          case 3: shouldCheckIn = (dayOfWeek === 0 || dayOfWeek === 6) && Math.random() < 0.5; break;
          case 4: shouldCheckIn = Math.random() < 0.4; break;
        }
        
        if (shouldCheckIn) {
          checkIns.push({
              id: this.generateId(),
              habitId: `sample-${habitIndex}`,
              checkInDate: date.getTime(),
              status: 'completed',
              createdAt: date.getTime()
          });
        }
      }
      return checkIns;
    };

    const habitsData = [
      { title: 'Morning Meditation', daysTarget: 30, categoryId: '30', color: this.COLORS[0] },
      { title: 'Drink 8 Glasses of Water', daysTarget: 21, categoryId: '21', color: this.COLORS[1] },
      { title: 'Exercise for 30 Minutes', daysTarget: 30, categoryId: '30', color: this.COLORS[2] },
      { title: 'Read for 20 Minutes', daysTarget: 50, categoryId: '50', color: this.COLORS[3] },
      { title: 'Practice Gratitude', daysTarget: 21, categoryId: '21', color: this.COLORS[4] }
    ];

    return habitsData.map((h, index) => {
      const randomTime = twoMonthsAgo.getTime() + Math.random() * (today.getTime() - twoMonthsAgo.getTime());
      
      return {
        id: this.generateId(),
        title: h.title,
        daysTarget: h.daysTarget,
        categoryId: h.categoryId,
        color: h.color,
        createdAt: randomTime,
        checkIns: generateCheckIns(index, randomTime),
        reminder: null
      };
    });
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 9);
  }

  private pickColor(index: number): string {
    return this.COLORS[index % this.COLORS.length];
  }

  private hhmmToMins(hhmm: string): number {
    const [h, m] = (hhmm || '00:00').split(':').map(Number);
    return h * 60 + m;
  }
}

