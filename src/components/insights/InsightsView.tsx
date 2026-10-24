import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Habit, CheckInRecord, UserProfile } from '../../types';
import { format, subDays, getDay } from 'date-fns';
import { BarChart2, Flame, Award, AlertCircle, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import { sound } from '../../services/audio';

interface Props {
  habits: Habit[];
  checkIns: CheckInRecord[];
  user: UserProfile;
}

export const InsightsView: React.FC<Props> = ({ habits, checkIns, user }) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');

  // Compute metrics
  const totalRecords = checkIns.length;
  const doneRecords = checkIns.filter((c) => c.status === 'done').length;
  const missedRecords = checkIns.filter((c) => c.status === 'missed').length;
  const skippedRecords = checkIns.filter((c) => c.status === 'skipped').length;

  const completionRate = totalRecords > 0 ? Math.round((doneRecords / totalRecords) * 100) : 0;

  // Most common skip/missed reason
  const reasonCounts: Record<string, number> = {};
  for (const c of checkIns) {
    if (c.reason) {
      reasonCounts[c.reason] = (reasonCounts[c.reason] || 0) + 1;
    }
  }
  let topReason = 'None';
  let maxReasonCount = 0;
  for (const [r, count] of Object.entries(reasonCounts)) {
    if (count > maxReasonCount) {
      topReason = r;
      maxReasonCount = count;
    }
  }

  // Best day of week
  const dayStats: { done: number; total: number }[] = Array.from({ length: 7 }, () => ({ done: 0, total: 0 }));
  for (const c of checkIns) {
    const d = new Date(c.date);
    const dayIdx = getDay(d);
    dayStats[dayIdx].total += 1;
    if (c.status === 'done') dayStats[dayIdx].done += 1;
  }
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDayName = 'Monday';
  let bestDayRate = -1;
  dayStats.forEach((stat, idx) => {
    const rate = stat.total > 0 ? stat.done / stat.total : 0;
    if (rate > bestDayRate) {
      bestDayRate = rate;
      bestDayName = DAY_NAMES[idx];
    }
  });

  // Overall Lab Score (0 - 100)
  // 50% consistency, 30% streak weight, 20% volume
  const streakBonus = Math.min(30, user.streak * 2);
  const volumeBonus = Math.min(20, Math.round(doneRecords * 0.5));
  const labScore = Math.min(100, Math.round(completionRate * 0.5 + streakBonus + volumeBonus));

  // 28-day timeline heatmap
  const past28Days = Array.from({ length: 28 }, (_, i) => {
    const dateStr = format(subDays(new Date(), 27 - i), 'yyyy-MM-dd');
    const dayRecords = checkIns.filter(
      (c) => c.date === dateStr && (selectedHabitId === 'all' || c.habitId === selectedHabitId)
    );
    const dayDone = dayRecords.filter((c) => c.status === 'done').length;
    const dayTotal = dayRecords.length;
    return {
      date: dateStr,
      dayDone,
      dayTotal,
      intensity: dayTotal === 0 ? 0 : Math.min(4, Math.ceil((dayDone / dayTotal) * 4)),
    };
  });

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-white tracking-tight">Lab Insights</h2>
        <p className="text-xs text-slate-400">Behavioral analytics and routine diagnostics</p>
      </div>

      {/* Lab Score Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-950/60 via-[#0d1322] to-pink-950/40 border border-purple-500/30 p-5 shadow-xl shadow-purple-500/10 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Composite Rating
              </span>
              <h3 className="font-display font-bold text-base text-white">Overall Lab Score</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-black text-3xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {labScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${labScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full"
          />
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          {labScore >= 80
            ? '🔥 Exceptional discipline! Your consistency places you in the top tier of all lab subjects.'
            : labScore >= 60
            ? '⚡ Solid rhythm. Maintain your check-in timing to boost streak multiplier to 2.0x.'
            : '🧪 Initial ramp up phase. Keep checking in daily to establish your compound momentum.'}
        </p>
      </div>

      {/* 2x2 Key Diagnostic Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0e1322] border border-white/[0.08] rounded-2xl p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
            Completion Rate
          </span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-display font-bold text-xl text-white">{completionRate}%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{doneRecords} done / {totalRecords} logged</span>
        </div>

        <div className="bg-[#0e1322] border border-white/[0.08] rounded-2xl p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
            Best Day
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-bold text-base text-white truncate">{bestDayName}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Peak energy day</span>
        </div>

        <div className="bg-[#0e1322] border border-white/[0.08] rounded-2xl p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
            Top Obstacle
          </span>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-base text-white truncate">{topReason}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {maxReasonCount > 0 ? `${maxReasonCount} times cited` : 'Zero friction'}
          </span>
        </div>

        <div className="bg-[#0e1322] border border-white/[0.08] rounded-2xl p-3.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
            Active Multiplier
          </span>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-pink-400" />
            <span className="font-display font-bold text-xl text-white">
              {user.streak >= 30 ? '2.0x' : user.streak >= 7 ? '1.5x' : user.streak >= 3 ? '1.2x' : '1.0x'}
            </span>
          </div>
          <span className="text-[10px] text-pink-300 mt-1 block">{user.streak}d streak</span>
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="bg-[#0e1322] border border-white/[0.08] rounded-3xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-bold text-sm text-white">Routine Heatmap</h4>
            <p className="text-[10px] text-slate-400">Past 28 days of activity</p>
          </div>
          <select
            value={selectedHabitId}
            onChange={(e) => {
              sound.playPop();
              setSelectedHabitId(e.target.value);
            }}
            className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="all">All Habits</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.emoji} {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* 7 columns x 4 rows grid */}
        <div className="grid grid-cols-7 gap-1.5 bg-black/30 p-2.5 rounded-2xl border border-white/5 mb-3">
          {past28Days.map((day) => {
            const colors = [
              'bg-white/[0.05]', // 0: None
              'bg-purple-950/60 border border-purple-500/30', // 1: Low
              'bg-purple-700/60 border border-purple-500/50', // 2: Medium
              'bg-pink-600/80 border border-pink-400/60', // 3: High
              'bg-gradient-to-tr from-cyan-400 to-pink-500 shadow-sm shadow-cyan-400/50', // 4: Perfect
            ];
            return (
              <div
                key={day.date}
                className={`h-7 rounded-lg transition-transform hover:scale-110 ${colors[day.intensity]}`}
                title={`${day.date}: ${day.dayDone}/${day.dayTotal} completed`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.05]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-950/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-700/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-pink-600/80" />
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
