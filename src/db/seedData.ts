import { db } from './dexie';
import { Habit, Reward, Friend, UserProfile, CheckInRecord } from '../types';
import { subDays, format } from 'date-fns';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-water',
    name: 'Hydration 2.5L',
    emoji: '💧',
    color: '#06b6d4', // cyan
    schedule: 'daily',
    difficulty: 'easy',
    focusDuration: 0,
    archived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-workout',
    name: 'Lab Cardio & Strength',
    emoji: '⚡',
    color: '#ec4899', // pink
    schedule: 'daily',
    difficulty: 'hard',
    focusDuration: 30,
    archived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-reading',
    name: 'Research & Read 20 Pgs',
    emoji: '📚',
    color: '#8b5cf6', // violet
    schedule: 'daily',
    difficulty: 'medium',
    focusDuration: 20,
    archived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-meditation',
    name: 'Neural Reset Meditation',
    emoji: '🧘',
    color: '#10b981', // emerald
    schedule: 'daily',
    difficulty: 'easy',
    focusDuration: 10,
    archived: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-code',
    name: 'Side Project Sprint',
    emoji: '💻',
    color: '#6366f1', // indigo
    schedule: 'weekdays',
    difficulty: 'hard',
    focusDuration: 45,
    archived: false,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_REWARDS: Reward[] = [
  {
    id: 'reward-game',
    name: 'Weekend Gaming Session Pass',
    emoji: '🎮',
    targetPoints: 180,
    status: 'unlocked', // ready to claim or test
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward-coffee',
    name: 'Specialty Single-Origin Beans',
    emoji: '☕',
    targetPoints: 450,
    status: 'locked',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward-headphones',
    name: 'Sony ANC Noise-Cancelling Headphones',
    emoji: '🎧',
    targetPoints: 1500,
    status: 'locked',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'friend-maya',
    name: 'Maya Lin',
    avatar: '⚡',
    level: 4,
    title: 'Streak Wizard',
    streak: 18,
    currentWeekPoints: 340,
    currentWeekDone: 7,
    currentWeekScheduled: 7,
    consistencyPercent: 100,
    heatMap: {},
    lastActive: '5m ago',
  },
  {
    id: 'friend-rahul',
    name: 'Rahul Sharma',
    avatar: '🤖',
    level: 3,
    title: 'Mad Scientist',
    streak: 14,
    currentWeekPoints: 290,
    currentWeekDone: 6,
    currentWeekScheduled: 7,
    consistencyPercent: 86,
    heatMap: {},
    lastActive: '18m ago',
  },
  {
    id: 'friend-elena',
    name: 'Elena Rostova',
    avatar: '🔥',
    level: 3,
    title: 'Mad Scientist',
    streak: 9,
    currentWeekPoints: 240,
    currentWeekDone: 6,
    currentWeekScheduled: 7,
    consistencyPercent: 86,
    heatMap: {},
    lastActive: '1h ago',
  },
  {
    id: 'friend-liam',
    name: 'Liam Chen',
    avatar: '🧬',
    level: 2,
    title: 'Test Subject',
    streak: 7,
    currentWeekPoints: 190,
    currentWeekDone: 5,
    currentWeekScheduled: 7,
    consistencyPercent: 71,
    heatMap: {},
    lastActive: '3h ago',
  },
  {
    id: 'friend-david',
    name: 'David Miller',
    avatar: '🛡️',
    level: 2,
    title: 'Test Subject',
    streak: 5,
    currentWeekPoints: 160,
    currentWeekDone: 5,
    currentWeekScheduled: 7,
    consistencyPercent: 71,
    heatMap: {},
    lastActive: '6h ago',
  },
  {
    id: 'friend-zara',
    name: 'Zara Patel',
    avatar: '✨',
    level: 1,
    title: 'Lab Rookie',
    streak: 3,
    currentWeekPoints: 110,
    currentWeekDone: 4,
    currentWeekScheduled: 7,
    consistencyPercent: 57,
    heatMap: {},
    lastActive: 'Yesterday',
  },
];

export const INITIAL_USER: UserProfile = {
  id: 'current-user',
  name: 'Alex Sterling',
  avatar: '🚀',
  points: 230,
  streak: 6,
  streakFreezes: 1,
  level: 2,
  title: 'Test Subject',
  reminderTime: '21:00',
  reminderEnabled: true,
  snoozeMinutes: 15,
  soundEnabled: true,
  hapticsEnabled: true,
  theme: 'dark',
  hasCompletedOnboarding: false,
  lastCheckInDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
};

export async function seedDatabase(force = false): Promise<void> {
  const habitCount = await db.habits.count();
  if (habitCount > 0 && !force) return;

  if (force) {
    await db.habits.clear();
    await db.checkIns.clear();
    await db.rewards.clear();
    await db.friends.clear();
    await db.cheers.clear();
    await db.userProfile.clear();
  }

  // Populate habits
  await db.habits.bulkAdd(INITIAL_HABITS);

  // Populate rewards
  await db.rewards.bulkAdd(INITIAL_REWARDS);

  // Populate friends with simulated heatmaps
  const today = new Date();
  const seededFriends = INITIAL_FRIENDS.map((friend) => {
    const heatMap: Record<string, number> = {};
    for (let i = 0; i < 28; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      // Simulate random activity consistent with their streak
      const activeProbability = friend.consistencyPercent / 100;
      heatMap[d] = Math.random() < activeProbability ? 1 : 0;
    }
    return { ...friend, heatMap };
  });
  await db.friends.bulkAdd(seededFriends);

  // Populate user profile
  await db.userProfile.put(INITIAL_USER);

  // Generate 7 days of realistic user checkins to give rich instant history
  const userCheckIns: CheckInRecord[] = [];
  for (let i = 1; i <= 7; i++) {
    const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
    for (const habit of INITIAL_HABITS) {
      userCheckIns.push({
        id: `${dateStr}_${habit.id}`,
        habitId: habit.id,
        date: dateStr,
        status: i === 4 && habit.id === 'habit-code' ? 'missed' : 'done',
        completedAt: new Date().toISOString(),
      });
    }
  }
  await db.checkIns.bulkAdd(userCheckIns);
}
