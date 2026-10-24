import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Flame, Check } from 'lucide-react';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  totalPointsEarned: number;
  newStreak: number;
  onClose: () => void;
}

export const PerfectDayCelebration: React.FC<Props> = ({
  isOpen,
  totalPointsEarned,
  newStreak,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    sound.playFanfare();
    haptics.celebration();

    // Multi-angle confetti explosion
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#8b5cf6', '#ec4899', '#06b6d4'] });
    fire(0.2, { spread: 60, colors: ['#fbbf24', '#f43f5e', '#34d399'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070913]/90 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border border-pink-500/40 rounded-3xl p-6 shadow-2xl shadow-pink-500/20 text-center overflow-hidden"
      >
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-pink-500/30 flex items-center justify-center mb-4"
          >
            <div className="w-full h-full bg-[#0d1117] rounded-[22px] flex items-center justify-center text-4xl">
              🌟
            </div>
          </motion.div>

          <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
            Perfection Achieved
          </span>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight mt-1 mb-2">
            Perfect Day!
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto mb-6">
            Flawless execution! Every single habit completed. The Lab awards you an all-habits clear bonus!
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Earned XP</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-xl font-bold font-display text-white">+{totalPointsEarned}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">+50 Bonus Included</span>
            </div>

            <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Streak Active</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xl font-bold font-display text-white">{newStreak} Days</span>
              </div>
              <span className="text-[10px] text-amber-300 font-semibold">Keep it roaring!</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 active:scale-95 transition-all"
          >
            Claim Lab XP 🧪
          </button>
        </div>
      </motion.div>
    </div>
  );
};
