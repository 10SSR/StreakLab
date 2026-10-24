import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Volume2, Smartphone, Download, RotateCcw, Activity, Moon, Sun, Trash2, Check, Sparkles } from 'lucide-react';
import { UserProfile, Habit, CheckInRecord } from '../../types';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';
import { scheduleTestReminder, requestNotificationPermission } from '../../services/notifications';

interface Props {
  isOpen: boolean;
  user: UserProfile;
  habits: Habit[];
  checkIns: CheckInRecord[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetDemo: () => void;
  onOpenHealth: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  user,
  habits,
  checkIns,
  onUpdateUser,
  onResetDemo,
  onOpenHealth,
  onClose,
}) => {
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleTestReminder = async () => {
    sound.playPop();
    haptics.medium();
    await requestNotificationPermission();
    setTestSent(true);

    scheduleTestReminder(user.streak, habits.length, 10, () => {
      sound.playCheck();
    });

    setTimeout(() => setTestSent(false), 12000);
  };

  const handleExportJson = () => {
    sound.playCheck();
    const data = {
      exportDate: new Date().toISOString(),
      user,
      habits,
      checkIns,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streaklab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full max-w-md bg-[#0c101d] border border-white/[0.12] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.08]">
          <h2 className="font-display font-bold text-lg text-white">Lab Settings</h2>
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

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Scheduled Reminder Settings */}
          <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Daily Reminder Alarm</span>
              </div>
              <input
                type="checkbox"
                checked={user.reminderEnabled}
                onChange={(e) => onUpdateUser({ reminderEnabled: e.target.checked })}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={user.reminderTime}
                  onChange={(e) => onUpdateUser({ reminderTime: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Snooze Window</label>
                <select
                  value={user.snoozeMinutes}
                  onChange={(e) => onUpdateUser({ snoozeMinutes: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </div>

            {/* Test Reminder Button */}
            <button
              onClick={handleTestReminder}
              disabled={testSent}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              {testSent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test reminder scheduled in 10s...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send test reminder in 10 seconds</span>
                </>
              )}
            </button>
          </div>

          {/* Sound & Haptics */}
          <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Audio Feedback (Synthesizer)</span>
              </div>
              <input
                type="checkbox"
                checked={user.soundEnabled}
                onChange={(e) => {
                  sound.enabled = e.target.checked;
                  onUpdateUser({ soundEnabled: e.target.checked });
                }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-white">Tactile Haptics</span>
              </div>
              <input
                type="checkbox"
                checked={user.hapticsEnabled}
                onChange={(e) => {
                  haptics.enabled = e.target.checked;
                  onUpdateUser({ hapticsEnabled: e.target.checked });
                }}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Diagnostics Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenHealth();
            }}
            className="w-full py-3 px-4 bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/30 rounded-2xl text-cyan-300 flex items-center justify-between text-xs font-bold transition-all"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>System & PWA Diagnostics (/health)</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              Inspect
            </span>
          </button>

          {/* Data Export */}
          <button
            onClick={handleExportJson}
            className="w-full py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 rounded-2xl text-slate-300 flex items-center justify-between text-xs font-semibold transition-all"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Habits & Check-ins (JSON)</span>
            </div>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to default test habits and simulated friends?')) {
                sound.playPop();
                onResetDemo();
                onClose();
              }
            }}
            className="w-full py-3 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 rounded-2xl text-red-400 flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
