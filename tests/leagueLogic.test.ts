import { describe, it, expect } from 'vitest';
import {
  getCurrentWeekMonday,
  calculateConsistency,
  rankLeaderboard,
  shouldResetWeeklyLeague,
  getCatchupNudge,
} from '../src/services/leagueLogic';
import { Friend } from '../src/types';

describe('League Logic & Weekly Reset', () => {
  it('calculates consistency percentage accurately', () => {
    expect(calculateConsistency(7, 7)).toBe(100);
    expect(calculateConsistency(3, 6)).toBe(50);
    expect(calculateConsistency(0, 5)).toBe(0);
    expect(calculateConsistency(0, 0)).toBe(0);
  });

  it('ranks members primarily by consistency %, then by points', () => {
    const mockFriends: Friend[] = [
      {
        id: '1',
        name: 'Rahul',
        avatar: '🤖',
        level: 3,
        title: 'Mad Scientist',
        streak: 12,
        currentWeekPoints: 280,
        currentWeekDone: 6,
        currentWeekScheduled: 7,
        consistencyPercent: 86,
        heatMap: {},
        lastActive: 'Just now',
      },
      {
        id: '2',
        name: 'Maya',
        avatar: '⚡',
        level: 4,
        title: 'Streak Wizard',
        streak: 20,
        currentWeekPoints: 310,
        currentWeekDone: 7,
        currentWeekScheduled: 7,
        consistencyPercent: 100, // Higher consistency wins
        heatMap: {},
        lastActive: '5m ago',
      },
      {
        id: '3',
        name: 'David',
        avatar: '🧬',
        level: 2,
        title: 'Test Subject',
        streak: 5,
        currentWeekPoints: 190,
        currentWeekDone: 6,
        currentWeekScheduled: 7,
        consistencyPercent: 86, // Equal consistency to Rahul, but fewer points (190 vs 280)
        heatMap: {},
        lastActive: '2h ago',
      },
    ];

    const ranked = rankLeaderboard(mockFriends);
    expect(ranked[0].name).toBe('Maya'); // 100%
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].name).toBe('Rahul'); // 86% with 280 pts
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].name).toBe('David'); // 86% with 190 pts
    expect(ranked[2].rank).toBe(3);
  });

  it('detects when Monday week reset has occurred', () => {
    const pastMonday = '2026-10-12';
    // Any date after next Monday triggers reset
    const futureDate = new Date('2026-10-24T12:00:00Z');
    expect(shouldResetWeeklyLeague(pastMonday, futureDate)).toBe(true);

    const thisMonday = getCurrentWeekMonday(futureDate);
    expect(shouldResetWeeklyLeague(thisMonday, futureDate)).toBe(false);
  });

  it('generates motivational catchup nudges based on rank gaps', () => {
    const ranked = rankLeaderboard([
      {
        id: 'user',
        name: 'You',
        avatar: '🚀',
        level: 2,
        title: 'Test Subject',
        streak: 4,
        currentWeekPoints: 150,
        currentWeekDone: 4,
        currentWeekScheduled: 5,
        consistencyPercent: 80,
        heatMap: {},
        isUser: true,
        lastActive: 'Just now',
      },
      {
        id: 'friend1',
        name: 'Elena',
        avatar: '🔥',
        level: 3,
        title: 'Mad Scientist',
        streak: 8,
        currentWeekPoints: 200,
        currentWeekDone: 5,
        currentWeekScheduled: 5,
        consistencyPercent: 100,
        heatMap: {},
        lastActive: '10m ago',
      },
    ]);

    const nudge = getCatchupNudge(ranked, 'user');
    expect(nudge).toBeDefined();
    expect(nudge).toContain('Elena');
  });
});
