import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../../services/leagueLogic';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  topThree: LeaderboardEntry[];
  onSelectMember: (member: LeaderboardEntry) => void;
}

export const Podium: React.FC<Props> = ({ topThree, onSelectMember }) => {
  if (topThree.length < 3) return null;

  // Podium order: 2nd place (left), 1st place (center), 3rd place (right)
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const handleTap = (entry: LeaderboardEntry) => {
    sound.playPop();
    haptics.light();
    onSelectMember(entry);
  };

  return (
    <div className="pt-6 pb-2 px-2 flex items-end justify-center gap-2 max-w-sm mx-auto">
      {/* 2nd Place */}
      <div
        onClick={() => handleTap(second)}
        className="flex-1 flex flex-col items-center cursor-pointer group"
      >
        <div className="relative mb-2 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-[2px] shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d1222] rounded-[14px] flex items-center justify-center text-2xl">
              {second.avatar}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 max-w-[80px] truncate text-center">
            {second.name}
          </span>
          <span className="text-[9px] font-semibold text-emerald-400">
            {second.consistencyPercent}%
          </span>
        </div>
        {/* Bar */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 75 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-full bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t border-x border-slate-400/30 flex flex-col items-center justify-center shadow-lg"
        >
          <span className="font-display font-black text-xl text-slate-300">2</span>
          <span className="text-[9px] text-slate-400 font-semibold">{second.currentWeekPoints} XP</span>
        </motion.div>
      </div>

      {/* 1st Place */}
      <div
        onClick={() => handleTap(first)}
        className="flex-1 flex flex-col items-center cursor-pointer group -mt-4"
      >
        <div className="relative mb-2 flex flex-col items-center">
          {/* Crown */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Crown className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </motion.div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px] shadow-xl shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d1222] rounded-[14px] flex items-center justify-center text-3xl">
              {first.avatar}
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-amber-300 mt-1 max-w-[85px] truncate text-center">
            {first.name}
          </span>
          <span className="text-[10px] font-bold text-emerald-400">
            {first.consistencyPercent}%
          </span>
        </div>
        {/* Bar */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 105 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full bg-gradient-to-t from-amber-950/60 via-purple-900/40 to-amber-500/30 rounded-t-2xl border-t border-x border-amber-400/50 flex flex-col items-center justify-center shadow-xl shadow-amber-500/10"
        >
          <span className="font-display font-black text-2xl text-amber-300">1</span>
          <span className="text-[10px] text-amber-200 font-bold">{first.currentWeekPoints} XP</span>
        </motion.div>
      </div>

      {/* 3rd Place */}
      <div
        onClick={() => handleTap(third)}
        className="flex-1 flex flex-col items-center cursor-pointer group"
      >
        <div className="relative mb-2 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-[2px] shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d1222] rounded-[14px] flex items-center justify-center text-2xl">
              {third.avatar}
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-300 mt-1 max-w-[80px] truncate text-center">
            {third.name}
          </span>
          <span className="text-[9px] font-semibold text-emerald-400">
            {third.consistencyPercent}%
          </span>
        </div>
        {/* Bar */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 55 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="w-full bg-gradient-to-t from-slate-900 to-amber-950/40 rounded-t-2xl border-t border-x border-amber-700/30 flex flex-col items-center justify-center shadow-lg"
        >
          <span className="font-display font-black text-xl text-amber-600">3</span>
          <span className="text-[9px] text-slate-400 font-semibold">{third.currentWeekPoints} XP</span>
        </motion.div>
      </div>
    </div>
  );
};
