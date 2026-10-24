import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell, ArrowRight, ShieldCheck, Smartphone, Flame, Trophy, CheckCircle2 } from 'lucide-react';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';
import { requestNotificationPermission } from '../../services/notifications';
import { UserProfile } from '../../types';

interface Props {
  isOpen: boolean;
  onComplete: (name: string, avatar: string, notificationsEnabled: boolean) => void;
}

const AVATARS = ['🚀', '⚡', '🤖', '🧬', '🔥', '🧪', '🔮', '👾', '👑', '🐺', '🦊', '🦾'];

const SLIDES = [
  {
    icon: '⚡',
    title: 'Precision Discipline',
    highlight: 'Multiply Your XP',
    desc: 'Complete daily habits within the 15-minute check-in window. Stack streaks to reach up to 2.0x point multipliers.',
  },
  {
    icon: '🎁',
    title: 'The Reward Vault',
    highlight: 'Gamify Real Desires',
    desc: 'Tie hard work to things you actually crave. Earn points to open the vault door with coin showers and trophy unlocks.',
  },
  {
    icon: '🏆',
    title: 'Weekly Friend Leagues',
    highlight: 'Compete on Consistency',
    desc: 'Ranked by true habit consistency %—so everyone competes on a level playing field. Monday resets keep the rivalry fresh.',
  },
];

export const OnboardingModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [slideIdx, setSlideIdx] = useState(0);
  const [name, setName] = useState('Alex Sterling');
  const [avatar, setAvatar] = useState('🚀');
  const [notifGranted, setNotifGranted] = useState(false);

  if (!isOpen) return null;

  const handleNextSlide = () => {
    sound.playPop();
    haptics.light();
    if (slideIdx < SLIDES.length - 1) {
      setSlideIdx(slideIdx + 1);
    } else {
      setStep(2);
    }
  };

  const handleSkipToDemo = () => {
    sound.playFanfare();
    haptics.success();
    onComplete('Cyber Explorer', '⚡', false);
  };

  const handleEnableNotifications = async () => {
    sound.playPop();
    haptics.medium();
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      setNotifGranted(true);
      sound.playCheck();
    }
  };

  const handleFinish = () => {
    sound.playFanfare();
    haptics.celebration();
    onComplete(name.trim() || 'Alex Sterling', avatar, notifGranted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070913]/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[#0f172a]/90 border border-white/[0.12] rounded-3xl p-6 shadow-2xl shadow-purple-500/10 overflow-hidden relative">
        {/* Top skip to demo button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkipToDemo}
            className="text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 transition-colors"
          >
            Try Demo Mode ⚡
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key={`slide-${slideIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600/40 via-pink-600/30 to-cyan-500/20 border border-white/20 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20 mb-6">
                {SLIDES[slideIdx].icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-1">
                {SLIDES[slideIdx].title}
              </span>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight mb-3">
                {SLIDES[slideIdx].highlight}
              </h2>
              <p className="text-sm text-slate-300 max-w-xs leading-relaxed mb-8">
                {SLIDES[slideIdx].desc}
              </p>

              {/* Slide indicators */}
              <div className="flex gap-1.5 mb-6">
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      slideIdx === i ? 'w-6 bg-pink-500' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2 group transition-all"
              >
                <span>{slideIdx === SLIDES.length - 1 ? 'Configure Profile' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-2"
            >
              <h2 className="text-2xl font-display font-bold text-white tracking-tight text-center mb-1">
                Choose Your Identity
              </h2>
              <p className="text-xs text-slate-400 text-center mb-5">
                Your alias in the competitive weekly leagues
              </p>

              {/* Avatar Selector */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-300 block mb-2">Select Avatar</label>
                <div className="grid grid-cols-6 gap-2 bg-black/30 p-2.5 rounded-2xl border border-white/5">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        haptics.light();
                        setAvatar(av);
                      }}
                      className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                        avatar === av
                          ? 'bg-purple-600/40 border-2 border-pink-500 scale-105 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Scientist Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={24}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm font-medium"
                />
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  haptics.light();
                  setStep(3);
                }}
                disabled={!name.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
              >
                <span>Set Reminders & PWA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-2"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3">
                <Bell className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight text-center mb-1">
                Scheduled Reminders
              </h2>
              <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
                Receive a daily check-in ping at 9:00 PM with your active streak at risk.
              </p>

              {/* Notification toggle button */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Browser Notifications</h4>
                      <p className="text-[11px] text-slate-400">Trigger 15-min countdown prompt</p>
                    </div>
                  </div>
                  <button
                    onClick={handleEnableNotifications}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      notifGranted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1'
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {notifGranted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enabled
                      </>
                    ) : (
                      'Allow'
                    )}
                  </button>
                </div>

                {/* iOS 16.4+ Instructions */}
                <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-semibold text-purple-300 block mb-0.5">📱 iOS Installation Note:</span>
                  To receive push notifications on iPhones (iOS 16.4+), tap the <strong>Share</strong> button in Safari and choose <strong>"Add to Home Screen"</strong>.
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Enter The Lab 🧪</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
