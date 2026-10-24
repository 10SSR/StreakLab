export type Difficulty = 'easy' | 'medium' | 'hard';
export type ScheduleType = 'daily' | 'weekdays' | 'custom';
export type CheckInStatus = 'done' | 'missed' | 'skipped';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  schedule: ScheduleType;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  difficulty: Difficulty;
  focusDuration?: number; // In minutes, optional timer
  reminderOverride?: string; // "HH:mm" optional
  archived?: boolean;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: CheckInStatus;
  reason?: string;
  completedAt?: string;
}

export interface DailySummary {
  date: string;
  totalScheduled: number;
  doneCount: number;
  missedCount: number;
  skippedCount: number;
  basePoints: number;
  bonusPoints: number;
  multiplier: number;
  totalPoints: number;
  isPerfectDay: boolean;
}

export interface Reward {
  id: string;
  name: string;
  emoji: string;
  targetPoints: number;
  status: 'locked' | 'unlocked' | 'bought';
  unlockedAt?: string;
  boughtAt?: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  title: string;
  streak: number;
  currentWeekPoints: number;
  currentWeekDone: number;
  currentWeekScheduled: number;
  consistencyPercent: number;
  heatMap: Record<string, number>; // date string -> status count (done)
  isUser?: boolean;
  lastActive: string;
}

export interface Cheer {
  id: string;
  fromName: string;
  toFriendId: string;
  emoji: string;
  message: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  streakFreezes: number;
  level: number;
  title: string;
  reminderTime: string; // "21:00"
  reminderEnabled: boolean;
  snoozeMinutes: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  hasCompletedOnboarding: boolean;
  lastCheckInDate?: string;
}
