import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Flame, Trophy, Send, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { Friend, UserProfile } from '../../types';
import { Podium } from './Podium';
import { FriendProfileModal } from './FriendProfileModal';
import { CheerPickerModal } from './CheerPickerModal';
import { InviteModal } from './InviteModal';
import { rankLeaderboard, getCatchupNudge, LeaderboardEntry } from '../../services/leagueLogic';
import { sound } from '../../services/audio';
import { haptics } from '../../services/haptics';

interface Props {
  friends: Friend[];
  user: UserProfile;
  leagueCode: string;
  onSendCheer: (friendId: string, emoji: string, message: string) => void;
  onJoinLeague: (code: string) => void;
}

export const LeagueView: React.FC<Props> = ({
  friends,
  user,
  leagueCode,
  onSendCheer,
  onJoinLeague,
}) => {
  const [boardType, setBoardType] = useState<'weekly' | 'alltime'>('weekly');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [cheerFriend, setCheerFriend] = useState<Friend | null>(null);
  const [isInviteOpen, setInviteOpen] = useState(false);

  // Combine user entry with friends
  const userFriendEntry: Friend = {
    id: user.id,
    name: `${user.name} (You)`,
    avatar: user.avatar,
    level: user.level,
    title: user.title,
    streak: user.streak,
    currentWeekPoints: user.points,
    currentWeekDone: 6,
    currentWeekScheduled: 7,
    consistencyPercent: 86,
    heatMap: {},
    isUser: true,
    lastActive: 'Just now',
  };

  const allMembers = [userFriendEntry, ...friends];
  const ranked = rankLeaderboard(allMembers);
  const topThree = ranked.slice(0, 3);
  const restOfLeaderboard = ranked.slice(3);

  const catchupNudge = getCatchupNudge(ranked, user.id);

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white tracking-tight">Weekly League</h2>
          <p className="text-xs text-slate-400">Ranked by Consistency % • Monday Resets</p>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            haptics.light();
            setInviteOpen(true);
          }}
          className="py-2 px-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite / Join</span>
        </button>
      </div>

      {/* Motivational Catchup Nudge Banner */}
      {catchupNudge && (
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-cyan-950/40 border border-purple-500/30 p-3 shadow-md flex items-center gap-2.5">
          <span className="text-lg flex-shrink-0">⚡</span>
          <p className="text-xs text-purple-200 font-semibold leading-relaxed">
            {catchupNudge}
          </p>
        </div>
      )}

      {/* Podium for Top 3 */}
      <div className="bg-[#0e1322] border border-white/[0.08] rounded-3xl p-3 shadow-xl">
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/[0.05]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            Top Division Podium
          </span>
          <span className="text-[10px] text-slate-400">Resets in 2d 10h</span>
        </div>

        <Podium topThree={topThree} onSelectMember={(m) => setSelectedFriend(m)} />
      </div>

      {/* Full Leaderboard List */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="font-display font-bold text-base text-white">Standings</h3>
          <span className="text-[11px] text-slate-400 font-medium">Fair Consistency Metric</span>
        </div>

        <div className="space-y-2">
          {ranked.map((member) => {
            const isSelf = member.isUser;
            return (
              <motion.div
                key={member.id}
                layout
                onClick={() => {
                  sound.playPop();
                  setSelectedFriend(member);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelf
                    ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-500/10'
                    : 'bg-[#0e1322] hover:bg-[#12192e] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-display font-bold text-sm w-5 text-center ${
                      member.rank === 1
                        ? 'text-amber-400'
                        : member.rank === 2
                        ? 'text-slate-300'
                        : member.rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}
                  >
                    #{member.rank}
                  </span>

                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {member.avatar}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`font-bold text-xs truncate ${
                          isSelf ? 'text-purple-300' : 'text-white'
                        }`}
                      >
                        {member.name}
                      </h4>
                      {isSelf && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {member.title}
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                        <Flame className="w-3 h-3" />
                        {member.streak}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Cheer Button */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="font-display font-bold text-sm text-emerald-400 block">
                      {member.consistencyPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {member.currentWeekPoints} XP
                    </span>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playPop();
                        haptics.light();
                        setCheerFriend(member);
                      }}
                      title="Send cheer"
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-purple-600/20 text-slate-400 hover:text-purple-300 border border-white/5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Friend Profile Modal */}
      <FriendProfileModal
        friend={selectedFriend}
        isOpen={Boolean(selectedFriend)}
        onOpenCheer={(f) => {
          setSelectedFriend(null);
          setCheerFriend(f);
        }}
        onClose={() => setSelectedFriend(null)}
      />

      {/* Cheer Picker Modal */}
      <CheerPickerModal
        friend={cheerFriend}
        isOpen={Boolean(cheerFriend)}
        onSendCheer={onSendCheer}
        onClose={() => setCheerFriend(null)}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        leagueCode={leagueCode}
        onJoinCode={onJoinLeague}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
};
