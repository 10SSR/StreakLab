import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  habitName: string;
  onSelectReason: (reason: string) => void;
  onClose: () => void;
}

const REASON_CHIPS = [
  { label: 'Tired', emoji: '😴' },
  { label: 'Busy', emoji: '🏃' },
  { label: 'Forgot', emoji: '🤔' },
  { label: 'Sick', emoji: '🤒' },
  { label: 'Not motivated', emoji: '💤' },
  { label: 'Emergency', emoji: '🚨' },
];

export const ReasonChipsModal: React.FC<Props> = ({ isOpen, habitName, onSelectReason, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-2xl text-center"
      >
        <span className="text-3xl block mb-2">🧬</span>
        <h3 className="font-display font-bold text-white text-lg mb-1">
          Why was "{habitName}" missed?
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Tracking obstacles helps the Lab diagnose your routine friction. (No shame, purely diagnostic!)
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {REASON_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                sound.playPop();
                haptics.light();
                onSelectReason(chip.label);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="text-xs text-slate-400 hover:text-white py-1 transition-colors"
        >
          Skip reason
        </button>
      </motion.div>
    </div>
  );
};
