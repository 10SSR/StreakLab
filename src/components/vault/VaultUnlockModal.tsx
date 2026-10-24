import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Gift, Check, X } from 'lucide-react';
import { Reward } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  reward: Reward | null;
  isOpen: boolean;
  onClaim: (rewardId: string) => void;
  onClose: () => void;
}

export const VaultUnlockModal: React.FC<Props> = ({ reward, isOpen, onClaim, onClose }) => {
  useEffect(() => {
    if (!isOpen || !reward) return;

    sound.playVaultBlast();
    haptics.celebration();

    // Cinematic continuous coin/confetti shower
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#06b6d4', '#10b981', '#fbbf24', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen, reward]);

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070913]/95 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-[#19153a] to-[#0c0f1d] border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl shadow-amber-500/20 text-center overflow-hidden"
      >
        {/* Animated Vault Light Rays */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-pink-600/20 to-transparent" />

        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Vault Doors Animation */}
        <div className="relative z-10 my-4">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Vault Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/60"
            />
            {/* Vault Center Orb */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.9, 1.1, 1] }}
              transition={{ duration: 0.8 }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-[#0a0d18] flex items-center justify-center text-4xl">
                {reward.emoji}
              </div>
            </motion.div>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mt-2 block">
            Vault Door Opened 🔓
          </span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight mt-1 mb-2">
            {reward.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto mb-6">
            You earned this! Your discipline powered every single point. Treat yourself with zero guilt!
          </p>

          <div className="bg-black/40 border border-amber-400/20 rounded-2xl p-3 mb-6 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Vault Target</span>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {reward.targetPoints} XP Completed
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                sound.playFanfare();
                haptics.celebration();
                onClaim(reward.id);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 font-extrabold text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>Mark as Bought 🎁</span>
            </button>
            <p className="text-[10px] text-slate-400">
              Moves this reward to your permanent Trophy Shelf
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
