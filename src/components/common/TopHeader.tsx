import React from 'react';
import { Flame, Sparkles, Volume2, VolumeX, ShieldCheck, Heart } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { UserProfile } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';
import { AnimatedCounter } from './AnimatedCounter';
import { getLevelInfo } from '../../services/scoring';

interface Props {
  user: UserProfile;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

export const TopHeader: React.FC<Props> = ({
  user,
  onOpenSettings,
  onToggleSound,
  soundEnabled,
}) => {
  const { setCurrentTab, isCheckInModalOpen, setCheckInModalOpen } = useAppStore();
  const levelInfo = getLevelInfo(user.points);

  // Flame intensity based on streak
  const flameColor =
    user.streak >= 30
      ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]'
      : user.streak >= 7
      ? 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]'
      : 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#070913]/80 border-b border-white/[0.08] px-4 py-3 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => {
            sound.playPop();
            setCurrentTab('today');
          }}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <span className="text-base select-none">🧪</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Streak Lab
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              {levelInfo.title} • Lv.{levelInfo.level}
            </p>
          </div>
        </button>

        {/* Stats Pill & Controls */}
        <div className="flex items-center gap-2">
          {/* Streak Counter */}
          <div className="flex items-center gap-1 bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-inner">
            <Flame className={`w-4 h-4 ${flameColor} animate-pulse`} />
            <span className="font-bold text-white text-sm">
              <AnimatedCounter value={user.streak} />
            </span>
            <span className="text-slate-400 text-[11px]">d</span>
            {user.streakFreezes > 0 && (
              <span
                title={`${user.streakFreezes} Streak Freeze saved`}
                className="ml-1 text-[11px] text-cyan-300 flex items-center"
              >
                ❄️{user.streakFreezes}
              </span>
            )}
          </div>

          {/* Points / XP Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <AnimatedCounter value={user.points} suffix=" XP" />
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playPop();
              haptics.light();
            }}
            aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Profile / Settings Avatar */}
          <button
            onClick={() => {
              sound.playPop();
              haptics.light();
              onOpenSettings();
            }}
            aria-label="Open settings"
            className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1.5px] hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-[#090d16] flex items-center justify-center text-sm">
              {user.avatar || '🚀'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
