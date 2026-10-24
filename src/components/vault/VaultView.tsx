import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, Plus, Sparkles, CheckCircle2, Lock, Unlock, Clock, AlertTriangle } from 'lucide-react';
import { Reward, UserProfile } from '../../types';
import { calculatePace } from '../../services/paceEstimator';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  rewards: Reward[];
  user: UserProfile;
  onAddNewReward: () => void;
  onOpenUnlockCinematic: (reward: Reward) => void;
}

export const VaultView: React.FC<Props> = ({
  rewards,
  user,
  onAddNewReward,
  onOpenUnlockCinematic,
}) => {
  // Sort rewards by targetPoints ascending
  const activeRewards = rewards
    .filter((r) => r.status !== 'bought')
    .sort((a, b) => a.targetPoints - b.targetPoints);

  const boughtRewards = rewards.filter((r) => r.status === 'bought');

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-5">
      {/* Vault Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white tracking-tight">Reward Vault</h2>
          <p className="text-xs text-slate-400">Emotional reward roadmap & pace velocity</p>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            haptics.light();
            onAddNewReward();
          }}
          className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 font-bold text-white text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 hover:scale-102 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Hero Roadmap Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1c142e] via-[#0d1222] to-[#1a1208] border border-amber-400/30 p-5 shadow-xl shadow-amber-500/10 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Vault Balance
              </span>
              <h3 className="font-display font-bold text-base text-white">Your Earned XP</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-300 font-display font-extrabold text-2xl">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{user.points} XP</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Every habit logged compounds into tangible trophies. Unlock items as your discipline crosses each threshold.
        </p>
      </div>

      {/* Rewards Roadmap Progress Path */}
      <div>
        <h3 className="font-display font-bold text-base text-white mb-3 px-1">
          Active Roadmap Queue
        </h3>

        {activeRewards.length === 0 ? (
          <div className="bg-[#0e1322] border border-white/[0.08] rounded-3xl p-6 text-center">
            <Trophy className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No active vault goals yet.</p>
            <button
              onClick={onAddNewReward}
              className="mt-3 text-xs text-amber-400 font-semibold underline"
            >
              Add your first desired reward
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 relative">
            {activeRewards.map((reward, index) => {
              const pace = calculatePace(user.points, reward.targetPoints);
              const isReady = user.points >= reward.targetPoints;
              const progressPercent = Math.min(100, Math.round((user.points / reward.targetPoints) * 100));

              return (
                <motion.div
                  key={reward.id}
                  layout
                  className={`p-4 rounded-3xl border transition-all ${
                    isReady
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#101428] to-[#120d22] border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                      : 'bg-[#0e1322] border-white/[0.08] shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                        {reward.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white truncate">{reward.name}</h4>
                          {isReady ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Unlocked 🔓
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-amber-400 mt-0.5 block">
                          {user.points} / {reward.targetPoints} XP ({progressPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Unlock Cinematic Trigger button */}
                    {isReady && (
                      <button
                        onClick={() => {
                          sound.playPop();
                          onOpenUnlockCinematic(reward);
                        }}
                        className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 font-extrabold text-white text-xs shadow-lg shadow-amber-500/30 animate-pulse hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Open Vault</span>
                      </button>
                    )}
                  </div>

                  {/* Progress Track */}
                  <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden mb-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isReady
                          ? 'bg-gradient-to-r from-amber-400 to-pink-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                          : 'bg-gradient-to-r from-purple-500 to-cyan-400'
                      }`}
                    />
                  </div>

                  {/* Velocity Pace Estimator & Dopamine Advice */}
                  <div className="bg-black/30 rounded-2xl p-2.5 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{pace.message}</span>
                    </div>

                    {pace.isTooFar && pace.recommendation && (
                      <div className="flex items-start gap-1.5 text-[10px] text-pink-300 font-medium pt-1 border-t border-white/5">
                        <AlertTriangle className="w-3 h-3 text-pink-400 flex-shrink-0 mt-0.5" />
                        <span>{pace.recommendation}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rewards Earned Trophy Shelf */}
      {boughtRewards.length > 0 && (
        <div className="pt-2">
          <h3 className="font-display font-bold text-base text-white mb-3 px-1 flex items-center gap-2">
            <span>Trophy Shelf</span>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">
              {boughtRewards.length} Claimed
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {boughtRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-[#0e1322] border border-amber-500/20 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0">
                  {reward.emoji}
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-white truncate">{reward.name}</h5>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Bought 🎁
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
