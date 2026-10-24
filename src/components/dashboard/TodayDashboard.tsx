import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Trophy, Sparkles, ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import { Habit, CheckInRecord, Reward, UserProfile } from '../../types';
import { HabitCard } from '../habits/HabitCard';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';
import { calculatePace } from '../../services/paceEstimator';
import { format } from 'date-fns';

interface Props {
  habits: Habit[];
  todayRecords: CheckInRecord[];
  closestReward: Reward | null;
  user: UserProfile;
  userRank: number;
  onOpenCheckIn: () => void;
  onToggleHabitDone: (habitId: string) => void;
  onOpenTimer: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onNavigateTab: (tab: any) => void;
}

export const TodayDashboard: React.FC<Props> = ({
  habits,
  todayRecords,
  closestReward,
  user,
  userRank,
  onOpenCheckIn,
  onToggleHabitDone,
  onOpenTimer,
  onEditHabit,
  onNavigateTab,
}) => {
  const activeHabits = habits.filter((h) => !h.archived);
  const doneCount = todayRecords.filter((r) => r.status === 'done').length;
  const totalCount = activeHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Pace for closest reward
  const pace = closestReward ? calculatePace(user.points, closestReward.targetPoints) : null;

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Today Progress Ring Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#121629] via-[#0d1222] to-[#160d24] border border-white/[0.1] p-5 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
              {format(new Date(), 'EEEE, MMM d')}
            </span>
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight mt-0.5">
              Today's Routine
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              {doneCount === totalCount && totalCount > 0
                ? '🌟 All habits finished! Perfect day!'
                : `${totalCount - doneCount} habits remaining for bonus XP`}
            </p>
          </div>

          {/* Glowing Circular Progress Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="32"
                stroke="#8b5cf6"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={2 * Math.PI * 32}
                animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - progressPercent / 100) }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display font-bold text-sm text-white">{progressPercent}%</span>
              <span className="text-[9px] text-slate-400 font-semibold">{doneCount}/{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Start Check-in Action Button */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-pink-400" />
            <span>Reminder set for <strong className="text-white">{user.reminderTime}</strong></span>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              haptics.medium();
              onOpenCheckIn();
            }}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white text-xs shadow-md shadow-purple-500/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Check-in</span>
          </button>
        </div>
      </div>

      {/* 2 Mini Stats Widgets: League Position + Closest Reward */}
      <div className="grid grid-cols-2 gap-3">
        {/* League Standing Widget */}
        <div
          onClick={() => {
            sound.playPop();
            onNavigateTab('league');
          }}
          className="bg-[#0e1322] hover:bg-[#12192e] border border-white/[0.08] rounded-3xl p-3.5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              League Standing
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-2xl text-amber-400">#{userRank}</span>
            <span className="text-[11px] text-slate-400 font-medium">in Division</span>
          </div>
          <span className="text-[10px] text-purple-300 font-semibold block mt-1">
            Mon reset • Resets in 2d
          </span>
        </div>

        {/* Reward Progress Widget */}
        <div
          onClick={() => {
            sound.playPop();
            onNavigateTab('vault');
          }}
          className="bg-[#0e1322] hover:bg-[#12192e] border border-white/[0.08] rounded-3xl p-3.5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Vault Roadmap
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          {closestReward ? (
            <div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-base">{closestReward.emoji}</span>
                <span className="font-bold text-xs text-white truncate">{closestReward.name}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (user.points / closestReward.targetPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No active goals</span>
          )}
        </div>
      </div>

      {/* Habits Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="font-display font-bold text-base text-white">Daily Habit Queue</h3>
          <span className="text-xs text-slate-400 font-medium">
            Tap check or launch timer
          </span>
        </div>

        <div className="space-y-2.5">
          {activeHabits.map((habit) => {
            const todayMatch = todayRecords.find((r) => r.habitId === habit.id);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayStatus={todayMatch?.status}
                onToggleDone={onToggleHabitDone}
                onOpenTimer={onOpenTimer}
                onEdit={onEditHabit}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
