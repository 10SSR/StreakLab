import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Timer, MoreVertical, Sparkles } from 'lucide-react';
import { Habit, CheckInStatus } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';
import confetti from 'canvas-confetti';

interface Props {
  habit: Habit;
  todayStatus?: CheckInStatus;
  onToggleDone: (habitId: string) => void;
  onOpenTimer: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
}

export const HabitCard: React.FC<Props> = ({
  habit,
  todayStatus,
  onToggleDone,
  onOpenTimer,
  onEdit,
}) => {
  const [xpAnimation, setXpAnimation] = useState(false);
  const isDone = todayStatus === 'done';
  const xpValue = habit.difficulty === 'easy' ? 10 : habit.difficulty === 'medium' ? 20 : 30;

  const handleDoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDone) {
      sound.playCheck();
      haptics.success();
      setXpAnimation(true);

      // Mini localized confetti
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.6 },
        colors: [habit.color || '#8b5cf6', '#ec4899', '#ffffff'],
      });

      setTimeout(() => setXpAnimation(false), 1200);
    } else {
      sound.playPop();
    }
    onToggleDone(habit.id);
  };

  return (
    <motion.div
      layout
      className={`relative rounded-3xl p-4 border transition-all duration-300 ${
        isDone
          ? 'bg-gradient-to-r from-emerald-950/20 via-[#0d1522] to-[#0d1522] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
          : 'bg-[#0e1322]/80 hover:bg-[#12192e] border-white/[0.08] shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Habit Icon + Info */}
        <div
          onClick={() => onEdit(habit)}
          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform active:scale-95"
            style={{
              backgroundColor: habit.color ? `${habit.color}20` : 'rgba(139, 92, 246, 0.15)',
              border: habit.color ? `1px solid ${habit.color}40` : '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            {habit.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={`font-bold text-sm truncate transition-colors ${
                isDone ? 'text-slate-300 line-through decoration-emerald-500/60' : 'text-white'
              }`}
            >
              {habit.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/5">
                +{xpValue} XP
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {habit.schedule}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Focus Timer Launch Button (if habit has duration configured) */}
          {habit.focusDuration && habit.focusDuration > 0 && !isDone && (
            <button
              onClick={() => {
                sound.playPop();
                onOpenTimer(habit);
              }}
              title="Launch Focus Timer"
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all flex items-center gap-1 text-xs font-semibold"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">{habit.focusDuration}m</span>
            </button>
          )}

          {/* Satisfying Checkmark Button */}
          <div className="relative">
            <button
              onClick={handleDoneClick}
              aria-label={isDone ? 'Mark habit as incomplete' : 'Mark habit as done'}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {isDone ? (
                <motion.svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </motion.svg>
              ) : (
                <Check className="w-5 h-5 opacity-60" />
              )}
            </button>

            {/* Flying XP Floating Badge */}
            <AnimatePresence>
              {xpAnimation && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-lg"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>+{xpValue}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
