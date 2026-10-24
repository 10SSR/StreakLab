import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Users, Sparkles } from 'lucide-react';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  leagueCode: string;
  onJoinCode: (code: string) => void;
  onClose: () => void;
}

export const InviteModal: React.FC<Props> = ({ isOpen, leagueCode, onJoinCode, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playPop();
    haptics.light();
    navigator.clipboard.writeText(`https://streaklab.app/league?join=${leagueCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    sound.playCheck();
    haptics.success();
    onJoinCode(inputCode.trim().toUpperCase());
    onClose();
  };

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
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Private Lab League</h3>
          <p className="text-xs text-slate-400">Compete with your inner circle of friends.</p>
        </div>

        {/* Share Invite Code */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
            Your League Invite Code
          </span>
          <div className="flex items-center justify-between gap-2 bg-black/40 px-3 py-2.5 rounded-xl border border-white/5">
            <span className="font-mono font-bold text-lg text-white tracking-widest">{leagueCode}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Join existing code */}
        <form onSubmit={handleJoin} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Join Another League</label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter 6-char code"
              maxLength={8}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={!inputCode.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-40 transition-all"
          >
            Join League
          </button>
        </form>
      </motion.div>
    </div>
  );
};
