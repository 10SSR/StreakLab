import React from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Friend } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  friend: Friend | null;
  isOpen: boolean;
  onSendCheer: (friendId: string, emoji: string, message: string) => void;
  onClose: () => void;
}

const REACTION_OPTIONS = [
  { emoji: '🔥', label: 'Streak Nudge', msg: "Keep that streak fire roaring!" },
  { emoji: '💪', label: 'Keep Crushing', msg: "Unstoppable discipline this week!" },
  { emoji: '👏', label: 'Brilliant Work', msg: "Top tier consistency in the lab!" },
  { emoji: '🧪', label: 'Mad Science', msg: "The experiment is yielding huge results!" },
  { emoji: '👑', label: 'Crown Respect', msg: "Podium worthy execution!" },
];

export const CheerPickerModal: React.FC<Props> = ({ friend, isOpen, onSendCheer, onClose }) => {
  if (!isOpen || !friend) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-[#0c101d] border border-white/10 rounded-3xl p-5 shadow-2xl relative"
      >
        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="text-3xl block mb-1">{friend.avatar}</span>
          <h3 className="font-display font-bold text-lg text-white">Cheer on {friend.name}</h3>
          <p className="text-xs text-slate-400">Pure positive energy. Streaks are won together.</p>
        </div>

        <div className="space-y-2 mb-4">
          {REACTION_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                sound.playCheck();
                haptics.success();
                onSendCheer(friend.id, opt.emoji, opt.msg);
                onClose();
              }}
              className="w-full p-3 bg-white/[0.04] hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 rounded-2xl flex items-center gap-3 text-left transition-all active:scale-98"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <span className="text-xs font-bold text-white block">{opt.label}</span>
                <span className="text-[11px] text-slate-400">{opt.msg}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
