import { Habit, CheckInRecord, Friend, Cheer, UserProfile } from '../../types';

export interface AuthAdapter {
  isConfigured: boolean;
  getCurrentUserId(): string | null;
  signInAnonymously(): Promise<string>;
  onAuthStateChanged(callback: (userId: string | null) => void): () => void;
  signOut(): Promise<void>;
}

export interface FirestoreAdapter {
  isConfigured: boolean;
  syncHabits(userId: string, habits: Habit[]): Promise<void>;
  submitDailyCheckIn(userId: string, records: CheckInRecord[], totalPointsEarned: number): Promise<void>;
  getWeeklyLeague(leagueId: string): Promise<Friend[]>;
  sendCheer(cheer: Omit<Cheer, 'id'>): Promise<void>;
}

export interface FCMAdapter {
  isConfigured: boolean;
  requestToken(): Promise<string | null>;
  onForegroundMessage(callback: (payload: { title: string; body: string }) => void): () => void;
}
