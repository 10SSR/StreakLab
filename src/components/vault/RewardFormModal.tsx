import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Trophy } from 'lucide-react';
import { Reward } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  onSave: (reward: Omit<Reward, 'id' | 'createdAt' | 'status'>) => void;
  onClose: () => void;
}

const REWARD_EMOJIS = ['🎁', '🎮', '☕', '🎧', '👟', '🍕', '✈️', '🎟️', '💻', '⌚', '📚', '🍣'];

export const RewardFormModal: React.FC<Props> = ({ isOpen, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [targetPoints, setTargetPoints] = useState<number>(300);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetPoints <= 0) return;

    sound.playCheck();
    haptics.medium();

    onSave({
      name: name.trim(),
      emoji,
      targetPoints: Number(targetPoints),
    });
  };

  const PRESETS = [
    { label: 'Small Treat', pts: 150 },
    { label: 'Medium Goal', pts: 450 },
    { label: 'Big Trophy', pts: 1200 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full max-w-md bg-[#0c101d] border border-white/[0.12] rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-white">Create Vault Reward</h2>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">What reward do you want?</label>
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {emoji}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony ANC Headphones, Fancy Dinner"
                required
                maxLength={45}
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pick Icon</label>
            <div className="flex flex-wrap gap-1.5 bg-black/30 p-2 rounded-2xl border border-white/5">
              {REWARD_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setEmoji(em);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    emoji === em ? 'bg-amber-500/40 border border-amber-400 scale-110 shadow-sm' : 'hover:bg-white/5'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Point Target (XP)</label>
            <input
              type="number"
              min="20"
              max="100000"
              value={targetPoints}
              onChange={(e) => setTargetPoints(Math.max(1, Number(e.target.value)))}
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm mb-2"
            />

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setTargetPoints(p.pts);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    targetPoints === p.pts
                      ? 'bg-amber-500/30 border-amber-400 text-white'
                      : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400">{p.label}</span>
                  <span className="font-bold text-amber-300">{p.pts} XP</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 text-sm transition-all"
          >
            Deposit Into Vault 🔒
          </button>
        </form>
      </motion.div>
    </div>
  );
};
