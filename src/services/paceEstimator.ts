export interface PaceResult {
  remainingPoints: number;
  averageDailyPoints: number;
  estimatedDays: number;
  estimatedWeeks: number;
  message: string;
  isTooFar: boolean;
  recommendation?: string;
  isUnlocked: boolean;
}

export function calculatePace(
  currentPoints: number,
  targetPoints: number,
  recentDailyPoints: number[] = []
): PaceResult {
  const isUnlocked = currentPoints >= targetPoints;
  const remainingPoints = Math.max(0, targetPoints - currentPoints);

  if (isUnlocked) {
    return {
      remainingPoints: 0,
      averageDailyPoints: 0,
      estimatedDays: 0,
      estimatedWeeks: 0,
      message: 'Goal achieved! Open the vault door to claim your prize! 🎁',
      isTooFar: false,
      isUnlocked: true,
    };
  }

  // Calculate average daily velocity from recent days or sensible baseline
  let avgDaily = 35;
  if (recentDailyPoints.length > 0) {
    const sum = recentDailyPoints.reduce((acc, p) => acc + p, 0);
    const nonZeroDays = recentDailyPoints.filter((p) => p > 0).length || 1;
    avgDaily = Math.max(10, Math.round(sum / nonZeroDays));
  }

  const estimatedDays = Math.max(1, Math.ceil(remainingPoints / avgDaily));
  const estimatedWeeks = Number((estimatedDays / 7).toFixed(1));

  let message = '';
  let isTooFar = false;
  let recommendation: string | undefined;

  if (estimatedWeeks > 6) {
    isTooFar = true;
    message = `At your current pace you'll earn this in ~${Math.ceil(estimatedWeeks)} weeks.`;
    recommendation =
      'Pro tip: Consider setting an intermediate 2 to 4 week reward (around ' +
      Math.round(currentPoints + avgDaily * 21) +
      ' pts) to keep your dopamine fire burning!';
  } else if (estimatedWeeks >= 2) {
    message = `At your current pace you'll earn this in ~${Math.ceil(estimatedWeeks)} weeks (${estimatedDays} days). Fantastic pace!`;
  } else if (estimatedDays > 1) {
    message = `At your current pace you'll earn this in ~${estimatedDays} days! You are right on the verge.`;
  } else {
    message = `Just ~${remainingPoints} points left! You could unlock this today or tomorrow!`;
  }

  return {
    remainingPoints,
    averageDailyPoints: avgDaily,
    estimatedDays,
    estimatedWeeks,
    message,
    isTooFar,
    recommendation,
    isUnlocked: false,
  };
}
