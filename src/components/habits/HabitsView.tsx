import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Sparkles, CheckSquare } from 'lucide-react';
import { Habit, CheckInRecord } from '../../types';
import { HabitCard } from './HabitCard';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  habits: Habit[];
  todayRecords: CheckInRecord[];
  onAddNew: () => void;
  onEdit: (habit: Habit) => void;
  onToggleDone: (habitId: string) => void;
  onOpenTimer: (habit: Habit) => void;
}

export const HabitsView: React.FC<Props> = ({
  habits,
  todayRecords,
  onAddNew,
  onEdit,
  onToggleDone,
  onOpenTimer,
}) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekdays'>('all');

  const filteredHabits = habits.filter((h) => {
    if (h.archived) return false;
    if (filter === 'all') return true;
    return h.schedule === filter;
  });

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white tracking-tight">Habit Matrix</h2>
          <p className="text-xs text-slate-400">Configure routines and focus timers</p>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            haptics.light();
            onAddNew();
          }}
          className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white text-xs shadow-lg shadow-purple-500/25 flex items-center gap-1.5 hover:scale-102 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-[#0e1322] p-1.5 rounded-2xl border border-white/[0.08]">
        {(['all', 'daily', 'weekdays'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sound.playPop();
              setFilter(tab);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Habit List */}
      <div className="space-y-2.5">
        {filteredHabits.map((habit) => {
          const todayMatch = todayRecords.find((r) => r.habitId === habit.id);
          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              todayStatus={todayMatch?.status}
              onToggleDone={onToggleDone}
              onOpenTimer={onOpenTimer}
              onEdit={onEdit}
            />
          );
        })}
      </div>
    </div>
  );
};
