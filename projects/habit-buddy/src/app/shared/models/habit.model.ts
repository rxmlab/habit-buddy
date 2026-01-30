export interface Habit {
  id: string;
  title: string;
  daysTarget: number;
  categoryId?: string; // Optional - will be assigned automatically
  badgeId: number | null; // Current badge level
  color: string;
  createdAt: number;
  checkIns: CheckIn[];
  currentStreak: number;
  reminder?: Reminder | null;
}

export interface CheckIn {
  id: string;
  habitId: string;
  checkInDate: number;
  status: 'completed' | 'skipped' | 'failed';
  note?: string;
  createdAt: number;
}

export interface Badge {
  id: number;
  slug: string; // 'novice' | 'beginner' etc.
  name: string;
  description: string;
  icon: string;
  daysRequired: number;
  nextBadgeId?: number;
}

export interface HabitBadge {
  // Keeping level for compatibility, but might migrate to using Badge object directly
  level: BadgeLevel;
  name: string;
  description: string;
  icon: string;
  daysRequired: number;
  achievedAt?: string;

  // Link to master badge data
  badgeId?: number;
}

export enum BadgeLevel {
  NOVICE = 'novice',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master'
}

export interface Reminder {
  time: string;
  days: number[];
  window: number;
}

export interface HabitStats {
  current: number;
  longest: number;
  total: number;
  breaks: number;
}

export interface WeeklyTrend {
  labels: string[];
  data: number[];
}

export interface MonthlyTrend {
  labels: string[];
  data: number[];
}

export interface YearlyTrend {
  labels: string[];
  data: number[];
}

export interface HabitCategory {
  value: string;
  label: string;
  days: number;
}
