import { Difficulty, CheckInStatus } from '../types';

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export const DAILY_POINTS_CAP = 300;
export const PERFECT_DAY_BONUS = 50;

export interface HabitItemStatus {
  difficulty: Difficulty;
  status: CheckInStatus;
}

export function getBasePoints(difficulty: Difficulty): number {
  return DIFFICULTY_POINTS[difficulty] ?? 10;
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
}

export interface DailyScoringResult {
  basePoints: number;
  multiplier: number;
  bonusPoints: number;
  rawTotal: number;
  totalPoints: number;
  isCapped: boolean;
  isPerfectDay: boolean;
  doneCount: number;
  missedCount: number;
  skippedCount: number;
}

export function calculateDailyPoints(
  items: HabitItemStatus[],
  currentStreak: number
): DailyScoringResult {
  let rawBase = 0;
  let doneCount = 0;
  let missedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    if (item.status === 'done') {
      rawBase += getBasePoints(item.difficulty);
      doneCount++;
    } else if (item.status === 'missed') {
      missedCount++;
    } else if (item.status === 'skipped') {
      skippedCount++;
    }
  }

  const multiplier = getStreakMultiplier(currentStreak);
  const multipliedPoints = Math.round(rawBase * multiplier);

  // Perfect day if at least 1 habit exists, doneCount > 0, and missedCount === 0
  const isPerfectDay = items.length > 0 && doneCount > 0 && missedCount === 0;
  const bonusPoints = isPerfectDay ? PERFECT_DAY_BONUS : 0;

  const rawTotal = multipliedPoints + bonusPoints;
  const isCapped = rawTotal > DAILY_POINTS_CAP;
  const totalPoints = Math.min(rawTotal, DAILY_POINTS_CAP);

  return {
    basePoints: rawBase,
    multiplier,
    bonusPoints,
    rawTotal,
    totalPoints,
    isCapped,
    isPerfectDay,
    doneCount,
    missedCount,
    skippedCount,
  };
}

export interface NextStreakResult {
  newStreak: number;
  newFreezes: number;
  usedFreeze: boolean;
  streakBroken: boolean;
}

export function calculateNextStreak(
  currentStreak: number,
  currentFreezes: number,
  doneCount: number,
  missedCount: number,
  skippedCount: number
): NextStreakResult {
  // If all habits were skipped (e.g. rest day) and no misses
  if (doneCount === 0 && missedCount === 0 && skippedCount > 0) {
    return {
      newStreak: currentStreak,
      newFreezes: currentFreezes,
      usedFreeze: false,
      streakBroken: false,
    };
  }

  // If there are missed habits
  if (missedCount > 0) {
    if (currentFreezes > 0) {
      // Streak saved by freeze!
      return {
        newStreak: currentStreak,
        newFreezes: currentFreezes - 1,
        usedFreeze: true,
        streakBroken: false,
      };
    } else {
      // Streak broken
      return {
        newStreak: 0,
        newFreezes: 0,
        usedFreeze: false,
        streakBroken: true,
      };
    }
  }

  // Normal progression: has at least one done habit and zero misses
  if (doneCount > 0) {
    const newStreak = currentStreak + 1;
    // Earn 1 freeze every 7th day of streak
    let newFreezes = currentFreezes;
    if (newStreak > 0 && newStreak % 7 === 0) {
      newFreezes += 1;
    }
    return {
      newStreak,
      newFreezes,
      usedFreeze: false,
      streakBroken: false,
    };
  }

  // No activity
  return {
    newStreak: currentStreak,
    newFreezes: currentFreezes,
    usedFreeze: false,
    streakBroken: false,
  };
}

export interface LevelThreshold {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
}

export const LEVELS: LevelThreshold[] = [
  { level: 1, title: 'Lab Rookie', minPoints: 0, maxPoints: 99 },
  { level: 2, title: 'Test Subject', minPoints: 100, maxPoints: 299 },
  { level: 3, title: 'Mad Scientist', minPoints: 300, maxPoints: 699 },
  { level: 4, title: 'Streak Wizard', minPoints: 700, maxPoints: 1499 },
  { level: 5, title: 'Lab Legend', minPoints: 1500, maxPoints: Infinity },
];

export interface LevelInfo {
  level: number;
  title: string;
  currentPoints: number;
  currentLevelMin: number;
  nextLevelMax: number;
  progressPercent: number;
  xpToNext: number;
}

export function getLevelInfo(totalPoints: number): LevelInfo {
  const points = Math.max(0, totalPoints);
  const current = LEVELS.find((l) => points >= l.minPoints && points <= l.maxPoints) || LEVELS[LEVELS.length - 1];

  if (current.maxPoints === Infinity) {
    return {
      level: current.level,
      title: current.title,
      currentPoints: points,
      currentLevelMin: current.minPoints,
      nextLevelMax: current.minPoints + 1000,
      progressPercent: 100,
      xpToNext: 0,
    };
  }

  const range = current.maxPoints - current.minPoints + 1;
  const progress = points - current.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  const xpToNext = Math.max(0, current.maxPoints + 1 - points);

  return {
    level: current.level,
    title: current.title,
    currentPoints: points,
    currentLevelMin: current.minPoints,
    nextLevelMax: current.maxPoints,
    progressPercent,
    xpToNext,
  };
}
