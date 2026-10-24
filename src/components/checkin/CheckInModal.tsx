import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XSquare, SkipForward, Sparkles, Clock, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit, CheckInStatus, CheckInRecord, UserProfile } from '../../types';
import { CheckInCountdownRing } from './CheckInCountdownRing';
import { ReasonChipsModal } from './ReasonChipsModal';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';
import { calculateDailyPoints, calculateNextStreak } from '../../services/scoring';
import { format, subDays, isBefore, setHours, setMinutes } from 'date-fns';

interface Props {
  isOpen: boolean;
  habits: Habit[];
  user: UserProfile;
  existingRecords: CheckInRecord[];
  onSaveCheckIn: (
    records: CheckInRecord[],
    pointsEarned: number,
    newStreak: number,
    newFreezes: number,
    isPerfectDay: boolean
  ) => void;
  onClose: () => void;
}

export const CheckInModal: React.FC<Props> = ({
  isOpen,
  habits,
  user,
  existingRecords,
  onSaveCheckIn,
  onClose,
}) => {
  // Check-in countdown: 15 minutes (900 seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(900);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [stagedStatuses, setStagedStatuses] = useState<Record<string, { status: CheckInStatus; reason?: string }>>({});
  const [reasonModalHabit, setReasonModalHabit] = useState<{ id: string; name: string } | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Can edit yesterday if current time is before noon (12:00 PM) today
  const noonToday = setMinutes(setHours(new Date(), 12), 0);
  const canEditYesterday = isBefore(new Date(), noonToday);

  // Initialize staged state from existing records when opened
  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, { status: CheckInStatus; reason?: string }> = {};
    for (const habit of habits) {
      const match = existingRecords.find((r) => r.habitId === habit.id && r.date === selectedDate);
      if (match) {
        initial[habit.id] = { status: match.status, reason: match.reason };
      }
    }
    setStagedStatuses(initial);
  }, [isOpen, selectedDate, existingRecords, habits]);

  // Countdown timer interval
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        // Subtle tick sound in last 30 seconds
        if (prev <= 30) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetStatus = (habitId: string, status: CheckInStatus) => {
    if (status === 'done') {
      sound.playCheck();
      haptics.success();
      setStagedStatuses((prev) => ({
        ...prev,
        [habitId]: { status: 'done' },
      }));
    } else if (status === 'missed') {
      sound.playPop();
      haptics.warning();
      const habit = habits.find((h) => h.id === habitId);
      setReasonModalHabit(habit ? { id: habit.id, name: habit.name } : null);
    } else if (status === 'skipped') {
      sound.playPop();
      haptics.light();
      setStagedStatuses((prev) => ({
        ...prev,
        [habitId]: { status: 'skipped' },
      }));
    }
  };

  const handleSelectReason = (reason: string) => {
    if (!reasonModalHabit) return;
    setStagedStatuses((prev) => ({
      ...prev,
      [reasonModalHabit.id]: { status: 'missed', reason },
    }));
    setReasonModalHabit(null);
  };

  const handleMarkAllDone = () => {
    sound.playFanfare();
    haptics.celebration();
    const updated: Record<string, { status: CheckInStatus; reason?: string }> = {};
    for (const habit of habits) {
      updated[habit.id] = { status: 'done' };
    }
    setStagedStatuses(updated);
  };

  const handleCompleteCheckIn = () => {
    // Build array of habit items for pure scoring calculation
    const scoringItems = habits.map((habit) => ({
      difficulty: habit.difficulty,
      status: stagedStatuses[habit.id]?.status ?? ('missed' as CheckInStatus),
    }));

    const scoringResult = calculateDailyPoints(scoringItems, user.streak);
    const streakResult = calculateNextStreak(
      user.streak,
      user.streakFreezes,
      scoringResult.doneCount,
      scoringResult.missedCount,
      scoringResult.skippedCount
    );

    const records: CheckInRecord[] = habits.map((habit) => ({
      id: `${selectedDate}_${habit.id}`,
      habitId: habit.id,
      date: selectedDate,
      status: stagedStatuses[habit.id]?.status ?? 'missed',
      reason: stagedStatuses[habit.id]?.reason,
      completedAt: new Date().toISOString(),
    }));

    sound.playFanfare();
    haptics.celebration();

    onSaveCheckIn(
      records,
      scoringResult.totalPoints,
      streakResult.newStreak,
      streakResult.newFreezes,
      scoringResult.isPerfectDay
    );
  };

  const allHabitsDecided = habits.every((h) => stagedStatuses[h.id] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="w-full max-w-lg bg-[#0c101d] border border-white/[0.12] rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <div>
              <h2 className="font-display font-bold text-lg text-white tracking-tight">
                Daily Check-in
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {selectedDate === todayStr ? "Today's Routine" : "Yesterday's Grace Period"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            aria-label="Close modal"
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date switcher & Urgency Countdown Ring */}
        <div className="px-5 pt-3 pb-2 bg-gradient-to-b from-white/[0.02] to-transparent">
          {/* Yesterday grace period switcher */}
          {canEditYesterday && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => {
                  sound.playPop();
                  setSelectedDate(yesterdayStr);
                }}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  selectedDate === yesterdayStr
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 bg-white/[0.05]'
                }`}
              >
                Yesterday (Grace till 12 PM)
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setSelectedDate(todayStr);
                }}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                  selectedDate === todayStr
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                    : 'text-slate-400 bg-white/[0.05]'
                }`}
              >
                Today
              </button>
            </div>
          )}

          {/* Ring Timer */}
          <CheckInCountdownRing totalSeconds={900} remainingSeconds={remainingSeconds} />

          {/* Quick All-Done Action */}
          <div className="flex justify-end mt-1 mb-2">
            <button
              onClick={handleMarkAllDone}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Done</span>
            </button>
          </div>
        </div>

        {/* Habit items list */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3">
          {habits.map((habit) => {
            const current = stagedStatuses[habit.id];
            const isDone = current?.status === 'done';
            const isMissed = current?.status === 'missed';
            const isSkipped = current?.status === 'skipped';

            return (
              <div
                key={habit.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : isMissed
                    ? 'bg-red-950/20 border-red-500/40'
                    : isSkipped
                    ? 'bg-slate-900/60 border-slate-700/50'
                    : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{habit.emoji}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{habit.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="capitalize">{habit.difficulty} (+{habit.difficulty === 'easy' ? 10 : habit.difficulty === 'medium' ? 20 : 30} XP)</span>
                        {current?.reason && (
                          <span className="text-amber-400 font-medium">({current.reason})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 action buttons: Done / Missed / Skipped */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSetStatus(habit.id, 'done')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-102'
                        : 'bg-white/[0.05] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-white/5'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(habit.id, 'missed')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isMissed
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-102'
                        : 'bg-white/[0.05] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/5'
                    }`}
                  >
                    <XSquare className="w-3.5 h-3.5" />
                    <span>Missed</span>
                  </button>

                  <button
                    onClick={() => handleSetStatus(habit.id, 'skipped')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isSkipped
                        ? 'bg-slate-600 text-white shadow-md scale-102'
                        : 'bg-white/[0.05] hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 border border-white/5'
                    }`}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Rest/Skip</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Submit Button */}
        <div className="p-5 border-t border-white/[0.08] bg-[#090d16]">
          <button
            onClick={handleCompleteCheckIn}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/45 active:scale-98 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Complete Daily Check-in</span>
          </button>
        </div>

        {/* Missed Reason Chips Modal */}
        <ReasonChipsModal
          isOpen={Boolean(reasonModalHabit)}
          habitName={reasonModalHabit?.name || ''}
          onSelectReason={handleSelectReason}
          onClose={() => {
            if (reasonModalHabit) {
              setStagedStatuses((prev) => ({
                ...prev,
                [reasonModalHabit.id]: { status: 'missed' },
              }));
            }
            setReasonModalHabit(null);
          }}
        />
      </motion.div>
    </div>
  );
};
