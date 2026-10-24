import { describe, it, expect } from 'vitest';
import { calculatePace } from '../src/services/paceEstimator';

describe('Reward Pace Estimator', () => {
  it('detects unlocked rewards immediately when target points are reached', () => {
    const pace = calculatePace(500, 450);
    expect(pace.isUnlocked).toBe(true);
    expect(pace.remainingPoints).toBe(0);
    expect(pace.isTooFar).toBe(false);
  });

  it('estimates velocity accurately for reasonable targets', () => {
    // Current 200, Target 500 => Remaining 300. Daily history avg 50 pts => 6 days (~0.9 weeks)
    const pace = calculatePace(200, 500, [50, 50, 50, 50]);
    expect(pace.remainingPoints).toBe(300);
    expect(pace.estimatedDays).toBe(6);
    expect(pace.isTooFar).toBe(false);
  });

  it('flags goals that are too far away (> 6 weeks) and provides recommendations', () => {
    // Current 100, Target 5000 => Remaining 4900. Daily avg 30 pts => 164 days (~23 weeks)
    const pace = calculatePace(100, 5000, [30, 30, 30]);
    expect(pace.isTooFar).toBe(true);
    expect(pace.estimatedWeeks).toBeGreaterThan(6);
    expect(pace.recommendation).toBeDefined();
    expect(pace.recommendation).toContain('Pro tip');
  });
});
