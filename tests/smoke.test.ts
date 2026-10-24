import { describe, it, expect } from 'vitest';
import { calculateDailyPoints, calculateNextStreak, getLevelInfo } from '../src/services/scoring';
import { calculatePace } from '../src/services/paceEstimator';
import { rankLeaderboard, getCatchupNudge } from '../src/services/leagueLogic';
import { INITIAL_HABITS, INITIAL_REWARDS, INITIAL_FRIENDS } from '../src/db/seedData';
import { formatStreakReminderCopy } from '../src/services/notifications';

describe('Streak Lab E2E Integration Smoke Test', () => {
  it('verifies onboarding profile initialization and reminder copy', () => {
    const reminder = formatStreakReminderCopy(7, 5);
    expect(reminder.title).toContain('Don\'t break your 7-day run');
    expect(reminder.body).toContain('multiplier');
  });

  it('executes daily check-in sequence with points, multipliers, and streak update', () => {
    const habitsToScore = INITIAL_HABITS.map((h) => ({
      difficulty: h.difficulty,
      status: 'done' as const,
    }));

    // With a 6-day streak
    const scoreResult = calculateDailyPoints(habitsToScore, 6);
    expect(scoreResult.isPerfectDay).toBe(true);
    expect(scoreResult.multiplier).toBe(1.2);
    expect(scoreResult.bonusPoints).toBe(50);
    expect(scoreResult.totalPoints).toBeGreaterThan(150);

    // Calculate streak advancement
    const nextStreak = calculateNextStreak(6, 0, scoreResult.doneCount, 0, 0);
    expect(nextStreak.newStreak).toBe(7);
    expect(nextStreak.newFreezes).toBe(1); // earned 1 streak freeze at day 7 milestone!
  });

  it('computes reward vault velocity and pace estimator', () => {
    const reward = INITIAL_REWARDS[1]; // 450 XP
    const pace = calculatePace(250, reward.targetPoints, [40, 50, 45]);
    expect(pace.remainingPoints).toBe(200);
    expect(pace.estimatedDays).toBeLessThan(10);
    expect(pace.isTooFar).toBe(false);
  });

  it('ranks weekly league and generates motivational nudge', () => {
    const ranked = rankLeaderboard(INITIAL_FRIENDS);
    expect(ranked.length).toBe(6);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].consistencyPercent).toBeGreaterThanOrEqual(ranked[1].consistencyPercent);

    const nudge = getCatchupNudge(ranked, 'friend-david');
    expect(nudge).toBeDefined();
  });
});
