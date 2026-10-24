import { AuthAdapter, FirestoreAdapter, FCMAdapter } from './types';
import { db } from '../../db/dexie';
import { Habit, CheckInRecord, Friend, Cheer } from '../../types';

export const localAuthAdapter: AuthAdapter = {
  isConfigured: true,
  getCurrentUserId() {
    return 'current-user';
  },
  async signInAnonymously() {
    return 'current-user';
  },
  onAuthStateChanged(callback) {
    callback('current-user');
    return () => {};
  },
  async signOut() {
    // Demo mode no-op
  },
};

export const localFirestoreAdapter: FirestoreAdapter = {
  isConfigured: true,
  async syncHabits(userId: string, habits: Habit[]) {
    await db.habits.clear();
    await db.habits.bulkPut(habits);
  },
  async submitDailyCheckIn(userId: string, records: CheckInRecord[], totalPointsEarned: number) {
    await db.checkIns.bulkPut(records);
    const user = await db.userProfile.get('current-user');
    if (user) {
      await db.userProfile.update('current-user', {
        points: user.points + totalPointsEarned,
      });
    }
  },
  async getWeeklyLeague(leagueId: string): Promise<Friend[]> {
    return await db.friends.toArray();
  },
  async sendCheer(cheerData: Omit<Cheer, 'id'>) {
    const cheer: Cheer = {
      ...cheerData,
      id: `cheer-${Date.now()}`,
    };
    await db.cheers.add(cheer);
  },
};

export const localFCMAdapter: FCMAdapter = {
  isConfigured: false, // In demo mode, local Notification API is used
  async requestToken() {
    return null;
  },
  onForegroundMessage() {
    return () => {};
  },
};
