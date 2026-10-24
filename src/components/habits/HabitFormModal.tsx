import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Clock, Calendar, Sparkles } from 'lucide-react';
import { Habit, Difficulty, ScheduleType } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  habitToEdit: Habit | null;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const EMOJI_PALETTE = ['💧', '⚡', '📚', '🧘', '💻', '🏃', '🥦', '🛌', '✍️', '🎸', '🎯', '🧼', '🚴', '🌱'];
const COLOR_PALETTE = ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#f43f5e'];

export const HabitFormModal: React.FC<Props> = ({
  isOpen,
  habitToEdit,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⚡');
  const [color, setColor] = useState('#8b5cf6');
  const [schedule, setSchedule] = useState<ScheduleType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [focusDuration, setFocusDuration] = useState<number>(0);
  const [reminderOverride, setReminderOverride] = useState<string>('');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setEmoji(habitToEdit.emoji);
      setColor(habitToEdit.color);
      setSchedule(habitToEdit.schedule);
      setCustomDays(habitToEdit.customDays || [1, 2, 3, 4, 5]);
      setDifficulty(habitToEdit.difficulty);
      setFocusDuration(habitToEdit.focusDuration || 0);
      setReminderOverride(habitToEdit.reminderOverride || '');
    } else {
      setName('');
      setEmoji('⚡');
      setColor('#8b5cf6');
      setSchedule('daily');
      setCustomDays([1, 2, 3, 4, 5]);
      setDifficulty('medium');
      setFocusDuration(0);
      setReminderOverride('');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playCheck();
    haptics.medium();

    onSave({
      id: habitToEdit?.id,
      name: name.trim(),
      emoji,
      color,
      schedule,
      customDays: schedule === 'custom' ? customDays : undefined,
      difficulty,
      focusDuration: Number(focusDuration) > 0 ? Number(focusDuration) : undefined,
      reminderOverride: reminderOverride || undefined,
    });
  };

  const toggleDay = (dayIndex: number) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full max-w-md bg-[#0c101d] border border-white/[0.12] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.08]">
          <h2 className="font-display font-bold text-lg text-white">
            {habitToEdit ? 'Edit Habit' : 'New Daily Habit'}
          </h2>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Name & Emoji */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Habit Name</label>
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {emoji}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 20 pages, 30m Run"
                required
                maxLength={40}
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pick Icon</label>
            <div className="flex flex-wrap gap-1.5 bg-black/30 p-2 rounded-2xl border border-white/5">
              {EMOJI_PALETTE.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setEmoji(em);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    emoji === em ? 'bg-purple-600/40 border border-purple-400 scale-110 shadow-sm' : 'hover:bg-white/5'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty / XP */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Difficulty & XP</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                const isSel = difficulty === d;
                const pts = d === 'easy' ? 10 : d === 'medium' ? 20 : 30;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setDifficulty(d);
                    }}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      isSel
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold capitalize">{d}</span>
                    <span className="text-[10px] text-purple-300 font-semibold">+{pts} XP</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Schedule</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['daily', 'weekdays', 'custom'] as ScheduleType[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setSchedule(s);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                    schedule === s
                      ? 'bg-pink-600/30 border-pink-400 text-white'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {schedule === 'custom' && (
              <div className="flex gap-1 justify-between bg-black/30 p-2 rounded-xl">
                {DAYS.map((day, idx) => {
                  const isChecked = customDays.includes(idx);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-9 h-8 rounded-lg text-[11px] font-bold transition-all ${
                        isChecked ? 'bg-pink-500 text-white' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {day[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Focus Timer Duration */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Focus Timer (Minutes, optional)
            </label>
            <input
              type="number"
              min="0"
              max="180"
              value={focusDuration || ''}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              placeholder="0 (no timer)"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            {habitToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onDelete(habitToEdit.id);
                }}
                className="py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-sm transition-all"
            >
              {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
