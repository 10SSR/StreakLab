import { describe, it, expect } from 'vitest';
import {
  getBasePoints,
  getStreakMultiplier,
  calculateDailyPoints,
  calculateNextStreak,
  getLevelInfo,
  DIFFICULTY_POINTS,
  DAILY_POINTS_CAP,
  PERFECT_DAY_BONUS,
} from '../src/services/scoring';

describe('Scoring & Multipliers', () => {
  it('correctly maps difficulty to base points', () => {
    expect(getBasePoints('easy')).toBe(10);
    expect(getBasePoints('medium')).toBe(20);
    expect(getBasePoints('hard')).toBe(30);
  });

  it('calculates correct streak multipliers', () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
    expect(getStreakMultiplier(3)).toBe(1.2);
    expect(getStreakMultiplier(6)).toBe(1.2);
    expect(getStreakMultiplier(7)).toBe(1.5);
    expect(getStreakMultiplier(29)).toBe(1.5);
    expect(getStreakMultiplier(30)).toBe(2.0);
    expect(getStreakMultiplier(100)).toBe(2.0);
  });

  it('calculates daily points with perfect day bonus and multiplier', () => {
    const items = [
      { difficulty: 'easy' as const, status: 'done' as const }, // 10
      { difficulty: 'medium' as const, status: 'done' as const }, // 20
      { difficulty: 'hard' as const, status: 'done' as const }, // 30
    ];
    // Base = 60, Multiplier for 7 days = 1.5 => 90 + 50 perfect bonus = 140
    const result = calculateDailyPoints(items, 7);
    expect(result.basePoints).toBe(60);
    expect(result.multiplier).toBe(1.5);
    expect(result.bonusPoints).toBe(PERFECT_DAY_BONUS);
    expect(result.totalPoints).toBe(140);
    expect(result.isPerfectDay).toBe(true);
  });

  it('never subtracts points for missed habits', () => {
    const items = [
      { difficulty: 'hard' as const, status: 'done' as const }, // 30
      { difficulty: 'medium' as const, status: 'missed' as const }, // 0
      { difficulty: 'easy' as const, status: 'missed' as const }, // 0
    ];
    const result = calculateDailyPoints(items, 0);
    expect(result.basePoints).toBe(30);
    expect(result.totalPoints).toBe(30);
    expect(result.bonusPoints).toBe(0);
    expect(result.isPerfectDay).toBe(false);
  });

  it('respects the daily points cap', () => {
    // 15 hard habits done = 450 pts * 2.0x = 900 pts
    const items = Array(15).fill({ difficulty: 'hard' as const, status: 'done' as const });
    const result = calculateDailyPoints(items, 35);
    expect(result.rawTotal).toBeGreaterThan(DAILY_POINTS_CAP);
    expect(result.totalPoints).toBe(DAILY_POINTS_CAP);
    expect(result.isCapped).toBe(true);
  });
});

describe('Streak Evolution & Streak Freezes', () => {
  it('increments streak on successful completion and awards freeze at 7 days', () => {
    const res1 = calculateNextStreak(6, 0, 2, 0, 0);
    expect(res1.newStreak).toBe(7);
    expect(res1.newFreezes).toBe(1); // earned 1 freeze
    expect(res1.streakBroken).toBe(false);

    const res2 = calculateNextStreak(7, 1, 2, 0, 0);
    expect(res2.newStreak).toBe(8);
    expect(res2.newFreezes).toBe(1);
  });

  it('preserves streak using a freeze when a habit is missed', () => {
    const res = calculateNextStreak(12, 1, 1, 1, 0);
    expect(res.newStreak).toBe(12);
    expect(res.newFreezes).toBe(0); // consumed freeze
    expect(res.usedFreeze).toBe(true);
    expect(res.streakBroken).toBe(false);
  });

  it('breaks streak when habit is missed without freezes', () => {
    const res = calculateNextStreak(12, 0, 1, 1, 0);
    expect(res.newStreak).toBe(0);
    expect(res.streakBroken).toBe(true);
  });

  it('maintains streak when all habits are skipped (rest day)', () => {
    const res = calculateNextStreak(15, 2, 0, 0, 3);
    expect(res.newStreak).toBe(15);
    expect(res.newFreezes).toBe(2);
    expect(res.usedFreeze).toBe(false);
    expect(res.streakBroken).toBe(false);
  });
});

describe('Level Titles and Progression', () => {
  it('correctly categorizes user levels based on points', () => {
    expect(getLevelInfo(0).title).toBe('Lab Rookie');
    expect(getLevelInfo(50).title).toBe('Lab Rookie');
    expect(getLevelInfo(100).title).toBe('Test Subject');
    expect(getLevelInfo(350).title).toBe('Mad Scientist');
    expect(getLevelInfo(800).title).toBe('Streak Wizard');
    expect(getLevelInfo(1600).title).toBe('Lab Legend');
  });
});
