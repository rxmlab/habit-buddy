import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, computed, EventEmitter, input, Output, signal, inject } from '@angular/core';
import { Bell, Calendar, Check, Clock, Crown, Link, LucideAngularModule, RotateCcw, Sparkles, Sprout, Star, Target, Trash2, Trophy } from 'lucide-angular';
import { CircularProgressComponent } from '../../../../shared/components/circular-progress/circular-progress.component';
import { DialogButton, DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { BadgeService } from '../../../../shared/services/badge.service';
import { Habit, HabitStats } from '../../../../shared/models/habit.model';
import { isSameDay, toLocalISODate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DialogComponent, CircularProgressComponent],
  providers: [DatePipe],
  templateUrl: './habit-card.component.html',
  styleUrl: './habit-card.component.scss'
})
export class HabitCardComponent {
  private badgeService = inject(BadgeService);
  // Modern signal inputs - automatically reactive
  habit = input.required<Habit>();
  stats = input.required<HabitStats>();

  @Output() checkin = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();
  @Output() editReminder = new EventEmitter<void>();
  @Output() viewCalendar = new EventEmitter<void>();

  // Dialog state
  protected showDeleteDialog = signal(false);
  protected deleteDialogButtons: DialogButton[] = [
    { label: 'Cancel', action: 'cancel', variant: 'secondary' },
    { label: 'Delete', action: 'confirm', variant: 'danger' }
  ];

  // Modern computed signals - automatically reactive to signal inputs
  protected readonly daysSinceStart = computed(() => {
    const habit = this.habit();

    if (!habit?.createdAt) {
      return habit?.checkIns?.length || 0; // Fallback to check-ins count if no creation date
    }

    const creationDate = new Date(habit.createdAt);
    creationDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total days from creation date to today (inclusive)
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  });

  protected readonly isCheckedToday = computed(() => {
    const habit = this.habit();
    if (!habit?.checkIns?.length) return false;

    // Use strictly same day check
    const now = new Date();
    return habit.checkIns.some(ci => isSameDay(ci.checkInDate, now));
  });

  // Get the goal created date
  protected readonly goalCreatedDate = computed(() => {
    const habit = this.habit();
    if (!habit?.createdAt) {
      return null;
    }

    return new Date(habit.createdAt);
  });

  constructor() { }

  // Progress calculation for the circular chart
  protected readonly progressPercentage = computed(() => {
    // Calculate percentage based on recent activity (last 14 days)
    const activityData = this.getRecentActivityDays();
    if (activityData.length === 0) {
      // Fallback to badge progress if no activity data
      const completed = this.habit()?.checkIns?.length || 0;
      return this.badgeService.getProgressToNextBadge(completed);
    }

    // Calculate percentage of completed days in recent activity
    const completedDays = activityData.filter(day => day.status === 'completed').length;
    const totalDays = activityData.length;
    return Math.round((completedDays / totalDays) * 100);
  });

  // Badge level text
  protected readonly badgeLevelText = computed(() => {
    const completed = this.habit()?.checkIns?.length || 0;
    const badge = this.badgeService.getBadgeForDays(completed);
    return badge?.name || 'Novice';
  });

  // Status text based on completion
  protected readonly statusText = computed(() => {
    if (this.isCheckedToday()) {
      return 'Good Job!';
    }
    return 'On Track';
  });

  // Motivational message
  protected readonly motivationalMessage = computed(() => {
    if (this.isCheckedToday()) {
      return "You're on fire! 🔥";
    }
    const habit = this.habit();
    if (habit.currentStreak >= 7) {
      return "Keep the streak alive!";
    } else if (habit.currentStreak >= 3) {
      return "Building momentum!";
    }
    return "Ready to check in?";
  });

  // Inspiring tooltip for chart hover
  protected readonly chartTooltip = computed(() => {
    const habit = this.habit();
    const completed = habit?.checkIns?.length || 0;
    const progress = this.progressPercentage();
    const level = this.badgeLevelText();
    const activityData = this.getRecentActivityDays();

    if (activityData.length > 0) {
      // Show recent activity-based messages
      const completedRecent = activityData.filter(day => day.status === 'completed').length;
      const streakBreaks = activityData.filter(day => day.status === 'break').length;
      const totalDays = activityData.length;

      const inspiringMessages = [
        `📊 ${progress}% consistency in\nlast ${totalDays} days!`,
        `🎯 ${completedRecent} out of ${totalDays} days\ncompleted recently!`,
        `💪 ${progress}% success rate\nshows great progress!`,
        `🌟 ${completedRecent} completed days\nout of ${totalDays} recent!`,
        `🚀 ${progress}% consistency\nbuilding strong habits!`,
        `✨ ${completedRecent}/${totalDays} recent days\ncompleted successfully!`,
        streakBreaks > 0 ?
          `⚠️ ${streakBreaks} streak breaks\nbut ${progress}% overall success!` :
          `🔥 No streak breaks!\n${progress}% consistency rate!`,
        `🏆 ${progress}% recent performance\nkeep up the momentum!`
      ];

      const messageIndex = habit.id.charCodeAt(0) % inspiringMessages.length;
      return inspiringMessages[messageIndex];
    } else {
      // Fallback to badge-based messages
      const inspiringMessages = [
        `🌟 ${progress}% complete on your\njourney to ${level} level!`,
        `💪 ${completed} days of dedication\nbuilding something amazing!`,
        `🎯 Every day counts - you're\n${progress}% closer to mastery!`,
        `🚀 ${level} level achieved through\n${completed} days of consistency!`
      ];

      const messageIndex = habit.id.charCodeAt(0) % inspiringMessages.length;
      return inspiringMessages[messageIndex];
    }
  });

  // Badge styling methods
  protected getBadgeClasses(): string {
    const habit = this.habit();
    const completedDays = habit?.checkIns?.length || 0;

    // Get badge (either from habit.badgeId or calculate from days)
    // If habit.badgeId exists, resolve it using BadgeService
    const badge = habit?.badgeId ?
      this.badgeService.getBadge(habit.badgeId) :
      this.badgeService.getBadgeForDays(completedDays);

    if (badge) {
      const { background, text, border } = this.badgeService.getBadgeColors(badge.slug);
      return `${background} ${text} border ${border}`;
    }

    return 'bg-gray-100 text-gray-600';
  }

  // Status message and styling
  // Helper to detect streak break
  private hasRecentStreakBreak(): boolean {
    const habit = this.habit();
    const stats = this.stats();

    // If current streak is 0 but longest streak is >= 3, check for recent break
    if (habit.currentStreak === 0 && stats.longest >= 3) {
      const checkIns = habit.checkIns || [];
      const checkInDates = new Set(checkIns.map(ci => toLocalISODate(ci.checkInDate)));

      // Check if there was a check-in in the last 3 days but not today/yesterday
      for (let i = 2; i <= 4; i++) {
        const date = toLocalISODate(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
        if (checkInDates.has(date)) {
          return true; // Recent activity but current streak broken
        }
      }
    }

    return false;
  }

  // Generate recent activity data for visualization - only from goal creation date onwards
  protected getRecentActivityDays(): Array<{ date: string, status: string, tooltip: string }> {
    const habit = this.habit();
    const checkIns = habit.checkIns || [];
    const checkInDates = new Set(checkIns.map(ci => toLocalISODate(ci.checkInDate)));

    const days = [];

    if (!habit?.createdAt) {
      return []; // No creation date, return empty
    }

    const creationDate = new Date(habit.createdAt);
    const today = new Date();

    // Calculate days from creation date to today
    const daysSinceCreation = Math.floor((today.getTime() - creationDate.getTime()) / (24 * 60 * 60 * 1000));

    // Show available history: if less than 21 days, show all available; if more, show last 21 days
    const daysToShow = Math.min(daysSinceCreation + 1, 21); // +1 to include today

    // Generate days from creation date onwards
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = toLocalISODate(date);
      const dayLabel = formatDate(date, 'EEE d', 'en-US'); // Standardized "Day Num" format

      let status = 'missed';
      let tooltip = `${dayLabel}: Missed`;

      if (checkInDates.has(dateStr)) {
        status = 'completed';
        tooltip = `${dayLabel}: Completed ✅`;
      } else if (i === 0) {
        status = 'today';
        tooltip = `Today: ${checkInDates.has(dateStr) ? 'Completed ✅' : 'Not yet completed'}`;
      } else {
        // Check if this is a streak break (had activity before and after)
        const prevDay = toLocalISODate(new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000));
        const nextDay = toLocalISODate(new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000));

        if (checkInDates.has(prevDay) && (checkInDates.has(nextDay) || i === 1)) {
          status = 'break';
          tooltip = `${dayLabel}: Streak Break ⚠️`;
        }
      }

      days.push({ date: dateStr, status, tooltip });
    }

    return days;
  }

  // Generate dynamic title for activity section
  protected getActivitySectionTitle(): string {
    const habit = this.habit();

    if (!habit?.createdAt) {
      return 'No Activity Yet';
    }

    const creationDate = new Date(habit.createdAt);
    const today = new Date();
    const daysSinceCreation = Math.floor((today.getTime() - creationDate.getTime()) / (24 * 60 * 60 * 1000));

    // Show available history: if less than 21 days, show all available; if more, show last 21 days
    const actualDays = Math.min(daysSinceCreation + 1, 21); // +1 to include today

    if (actualDays === 1) {
      return 'Today';
    } else {
      return `Last ${actualDays} Days`;
    }
  }

  protected getStatusMessage(): string {
    if (this.isCheckedToday()) {
      const messages = [
        "✅ Completed today!",
        "🎉 Well done today!",
        "⭐ Great job today!",
        "💪 Nailed it today!",
        "🔥 On fire today!"
      ];
      const habit = this.habit();
      const index = (habit?.id?.charCodeAt(0) ?? 0) % messages.length;
      return messages[index];
    } else {
      const stats = this.stats();
      const habit = this.habit();

      // Check for streak break first
      if (this.hasRecentStreakBreak()) {
        return "⚠️ Streak broken - get back on track!";
      }

      if (habit.currentStreak >= 7) {
        return "🔥 Keep the streak alive!";
      } else if (habit.currentStreak >= 3) {
        return "⚡ Building momentum!";
      } else {
        return "🚀 Ready to check in?";
      }
    }
  }

  protected getStatusClasses(): string {
    if (this.isCheckedToday()) {
      return 'bg-green-50 text-green-700 border border-green-200';
    } else {
      const stats = this.stats();
      const habit = this.habit();

      // Check for streak break first - show orange
      if (this.hasRecentStreakBreak()) {
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      }

      if (habit.currentStreak >= 7) {
        return 'bg-red-50 text-red-700 border border-red-200';
      } else if (habit.currentStreak >= 3) {
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      } else {
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      }
    }
  }

  protected getBadgeIcon(): any {
    const iconMap: { [key: string]: any } = {
      'Crown': Crown,
      'Trophy': Trophy,
      'Star': Star,
      'Target': Target,
      'Sprout': Sprout,
      'Sparkles': Sparkles
    };

    const habit = this.habit();
    const completedDays = habit?.checkIns?.length || 0;

    // Get badge config (either from habit.badge or calculate from days)
    const badge = habit?.badgeId ?
      this.badgeService.getBadge(habit.badgeId) :
      this.badgeService.getBadgeForDays(completedDays);

    return iconMap[badge?.icon || 'Sparkles'] || Sparkles;
  }

  protected getDaysText(days: number[]): string {
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => weekdayNames[d]).join(',');
  }

  protected onCheckin(): void {
    if (this.isCheckedToday()) {
      return; // Prevent duplicate check-ins or toggling off (strict one-way)
    }
    this.checkin.emit();
  }

  protected onRemove(): void {
    this.showDeleteDialog.set(true);
  }

  protected onDeleteDialogClose(): void {
    this.showDeleteDialog.set(false);
  }

  protected onDeleteDialogAction(action: string): void {
    if (action === 'confirm') {
      this.remove.emit();
    }
    this.showDeleteDialog.set(false);
  }

  protected getDeleteMessage(): string {
    const habit = this.habit();
    return `Are you sure you want to delete "${habit?.title || 'this habit'}"? This action cannot be undone and will remove all progress data.`;
  }

  protected onEditReminder(): void {
    this.editReminder.emit();
  }

  protected onViewCalendar(): void {
    this.viewCalendar.emit();
  }

  // Lucide icons
  protected readonly ClockIcon = Clock;
  protected readonly CalendarIcon = Calendar;
  protected readonly Trash2Icon = Trash2;
  protected readonly CheckIcon = Check;
  protected readonly LinkIcon = Link;
  protected readonly RotateCcwIcon = RotateCcw;
  protected readonly BellIcon = Bell;
}