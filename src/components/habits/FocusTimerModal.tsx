import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Habit } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  habit: Habit | null;
  isOpen: boolean;
  onCompleteHabit: (habitId: string) => void;
  onClose: () => void;
}

export const FocusTimerModal: React.FC<Props> = ({ habit, isOpen, onCompleteHabit, onClose }) => {
  const defaultMinutes = habit?.focusDuration || 20;
  const totalSeconds = defaultMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (habit) {
      const secs = (habit.focusDuration || 20) * 60;
      setRemaining(secs);
      setIsRunning(false);
    }
  }, [habit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            sound.playFanfare();
            haptics.celebration();
            if (habit) onCompleteHabit(habit.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remaining, habit, onCompleteHabit]);

  if (!isOpen || !habit) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remaining / totalSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-[#0d1222] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 text-center relative overflow-hidden"
      >
        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-3xl mb-1">{habit.emoji}</div>
        <h3 className="font-display font-bold text-lg text-white mb-1">{habit.name}</h3>
        <p className="text-xs text-slate-400 mb-6">Focus Session • Auto-marks habit Done when finished</p>

        {/* Big Circular Focus Ring */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#06b6d4"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="font-display font-extrabold text-3xl text-cyan-400 tracking-tight tabular-nums">
              {formatted}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-widest mt-1">
              {isRunning ? 'Focused' : remaining === 0 ? 'Completed' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playPop();
              haptics.light();
              setRemaining(totalSeconds);
              setIsRunning(false);
            }}
            title="Reset"
            className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sound.playPop();
              haptics.medium();
              setIsRunning(!isRunning);
            }}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-lg shadow-cyan-500/30 flex items-center gap-2 hover:scale-102 active:scale-98 transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playFanfare();
              haptics.celebration();
              onCompleteHabit(habit.id);
            }}
            title="Quick Finish"
            className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
