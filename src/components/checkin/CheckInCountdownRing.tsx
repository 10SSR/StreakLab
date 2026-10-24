import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  totalSeconds: number; // e.g. 900 (15 min)
  remainingSeconds: number;
}

export const CheckInCountdownRing: React.FC<Props> = ({ totalSeconds, remainingSeconds }) => {
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  // Minutes and seconds
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Urgency color shift: Green (> 5 min) -> Amber (2 - 5 min) -> Red (< 2 min)
  const isUrgent = remainingSeconds <= 120;
  const isWarning = remainingSeconds > 120 && remainingSeconds <= 300;

  let strokeColor = '#10b981'; // cyber emerald
  let glowColor = 'rgba(16, 185, 129, 0.5)';
  if (isUrgent) {
    strokeColor = '#ef4444'; // crimson
    glowColor = 'rgba(239, 68, 68, 0.8)';
  } else if (isWarning) {
    strokeColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.6)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className={`relative w-36 h-36 flex items-center justify-center ${isUrgent ? 'animate-pulse' : ''}`}>
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
          {/* Background track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Glowing Progress Ring */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span
            className={`font-display font-extrabold text-2xl tracking-tight tabular-nums transition-colors ${
              isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {formattedTime}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            {isUrgent ? 'Final Sprint!' : 'Check-in Window'}
          </span>
        </div>
      </div>
    </div>
  );
};
