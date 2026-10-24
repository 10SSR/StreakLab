import Dexie, { type Table } from 'dexie';
import { Habit, CheckInRecord, Reward, Friend, Cheer, UserProfile } from '../types';

export class StreakLabDatabase extends Dexie {
  habits!: Table<Habit, string>;
  checkIns!: Table<CheckInRecord, string>;
  rewards!: Table<Reward, string>;
  friends!: Table<Friend, string>;
  cheers!: Table<Cheer, string>;
  userProfile!: Table<UserProfile, string>;

  constructor() {
    super('StreakLabDB');

    this.version(1).stores({
      habits: 'id, name, schedule, difficulty, archived, createdAt',
      checkIns: 'id, habitId, date, status, [date+habitId]',
      rewards: 'id, status, targetPoints, createdAt',
      friends: 'id, name, level, streak, consistencyPercent',
      cheers: 'id, toFriendId, timestamp',
      userProfile: 'id',
    });
  }
}

export const db = new StreakLabDatabase();
