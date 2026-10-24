import { Friend } from '../types';
import { startOfWeek, format, isAfter, parseISO } from 'date-fns';

export interface LeaderboardEntry extends Friend {
  rank: number;
}

export function getCurrentWeekMonday(date: Date = new Date()): string {
  // ISO week starts on Monday
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

export function calculateConsistency(done: number, scheduled: number): number {
  if (scheduled <= 0) return 0;
  return Math.min(100, Math.round((done / scheduled) * 100));
}

export function rankLeaderboard(members: Friend[]): LeaderboardEntry[] {
  // Sort descending by consistencyPercent, then by currentWeekPoints
  const sorted = [...members].sort((a, b) => {
    if (b.consistencyPercent !== a.consistencyPercent) {
      return b.consistencyPercent - a.consistencyPercent;
    }
    return b.currentWeekPoints - a.currentWeekPoints;
  });

  return sorted.map((member, index) => ({
    ...member,
    rank: index + 1,
  }));
}

export function getCatchupNudge(leaderboard: LeaderboardEntry[], userId: string): string | null {
  const userEntry = leaderboard.find((m) => m.id === userId || m.isUser);
  if (!userEntry) return null;

  if (userEntry.rank === 1) {
    const runnerUp = leaderboard[1];
    if (runnerUp) {
      const diff = userEntry.currentWeekPoints - runnerUp.currentWeekPoints;
      return `👑 You are leading the league! ${runnerUp.name} is ${Math.max(0, diff)} pts behind you.`;
    }
    return `👑 You are holding 1st place on the podium!`;
  }

  // Person directly ahead
  const ahead = leaderboard.find((m) => m.rank === userEntry.rank - 1);
  if (ahead) {
    const ptDiff = ahead.currentWeekPoints - userEntry.currentWeekPoints;
    const consDiff = ahead.consistencyPercent - userEntry.consistencyPercent;
    if (consDiff > 0) {
      return `⚡ You're ${consDiff}% consistency behind ${ahead.name} (#${ahead.rank}). Check in today to overtake!`;
    }
    return `🔥 You're ${Math.max(10, ptDiff)} points behind ${ahead.name} (#${ahead.rank}). Keep pushing!`;
  }

  return null;
}

export function shouldResetWeeklyLeague(lastResetDateStr: string, currentDate: Date = new Date()): boolean {
  const currentMonday = getCurrentWeekMonday(currentDate);
  if (!lastResetDateStr) return true;
  return currentMonday !== lastResetDateStr;
}
