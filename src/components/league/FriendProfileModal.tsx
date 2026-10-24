import React from 'react';
import { motion } from 'framer-motion';
import { X, Flame, Trophy, Sparkles, Send } from 'lucide-react';
import { Friend } from '../../types';
import { sound } from '../../services/audio';

interface Props {
  friend: Friend | null;
  isOpen: boolean;
  onOpenCheer: (friend: Friend) => void;
  onClose: () => void;
}

export const FriendProfileModal: React.FC<Props> = ({ friend, isOpen, onOpenCheer, onClose }) => {
  if (!isOpen || !friend) return null;

  // Mini 28-day activity grid
  const days = Array.from({ length: 28 }, (_, i) => {
    // Generate simple deterministic pattern from friend's consistency
    const isActive = (i + friend.streak) % (Math.floor(100 / (friend.consistencyPercent || 70))) !== 0;
    return isActive;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-[#0c101d] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
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

        {/* Avatar & Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 p-[2px] shadow-xl shadow-purple-500/20 mb-3">
            <div className="w-full h-full bg-[#0d1222] rounded-[22px] flex items-center justify-center text-4xl">
              {friend.avatar}
            </div>
          </div>
          <h3 className="font-display font-bold text-xl text-white tracking-tight">{friend.name}</h3>
          <p className="text-xs text-purple-300 font-semibold mt-0.5">
            {friend.title} • Level {friend.level}
          </p>
          <span className="text-[10px] text-slate-400 mt-1">Active: {friend.lastActive}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Streak</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-white">{friend.streak}d</span>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Consistency</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">
              {friend.consistencyPercent}%
            </span>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Weekly XP</span>
            <span className="text-sm font-bold text-purple-300 mt-1 block">
              {friend.currentWeekPoints}
            </span>
          </div>
        </div>

        {/* 28-day Activity Heatmap Preview */}
        <div className="mb-6">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Recent 28-Day Heatmap
          </span>
          <div className="grid grid-cols-7 gap-1.5 bg-black/40 p-2.5 rounded-2xl border border-white/5">
            {days.map((isActive, idx) => (
              <div
                key={idx}
                className={`h-4 rounded-md transition-all ${
                  isActive ? 'bg-purple-500 shadow-sm shadow-purple-500/50' : 'bg-white/[0.06]'
                }`}
                title={`Day ${idx + 1}: ${isActive ? 'Active' : 'Rest'}`}
              />
            ))}
          </div>
        </div>

        {/* Cheer Button */}
        <button
          onClick={() => {
            sound.playPop();
            onOpenCheer(friend);
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Send Cheer or Nudge</span>
        </button>
      </motion.div>
    </div>
  );
};
