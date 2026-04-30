import {
  inferProgressionState,
  suggestNextReps,
  suggestNextLoad,
} from '../../services/progressionService.js';

describe('inferProgressionState', () => {
  test('returns "deload" when failedRepMinTwice is true', () => {
    expect(inferProgressionState({ failedRepMinTwice: true })).toBe('deload');
  });

  test('returns "hold" when readinessAvg is <= 2.5', () => {
    expect(inferProgressionState({ readinessAvg: 2.5 })).toBe('hold');
    expect(inferProgressionState({ readinessAvg: 1.0 })).toBe('hold');
  });

  test('returns "up" when hitRepMaxAtLowRpeTwice is true and athlete is ready', () => {
    expect(
      inferProgressionState({ hitRepMaxAtLowRpeTwice: true, readinessAvg: 4 })
    ).toBe('up');
  });

  test('returns "hold" when last 3 reps are stagnant', () => {
    // stagnant: |c - a| < 2 && b <= c + 2
    const result = inferProgressionState({ lastThreeReps: [10, 10, 10], readinessAvg: 4 });
    expect(result).toBe('hold');
  });

  test('returns "hold" as default when no special conditions met', () => {
    expect(inferProgressionState({})).toBe('hold');
    expect(inferProgressionState({ lastThreeReps: [], readinessAvg: 3 })).toBe('hold');
  });

  test('deload takes precedence over low readiness', () => {
    expect(
      inferProgressionState({ failedRepMinTwice: true, readinessAvg: 1 })
    ).toBe('deload');
  });
});

describe('suggestNextReps', () => {
  test('returns 0 reps and a note when currentReps is 0 or falsy', () => {
    const result = suggestNextReps({ currentReps: 0, progressionState: 'up' });
    expect(result.reps).toBe(0);
    expect(result.note).toMatch(/conservatively/i);
  });

  test('adds 2 reps when progressionState is "up"', () => {
    const result = suggestNextReps({ currentReps: 10, progressionState: 'up' });
    expect(result.reps).toBe(12);
  });

  test('caps reps at 50 when progressing up', () => {
    const result = suggestNextReps({ currentReps: 49, progressionState: 'up' });
    expect(result.reps).toBe(50);
  });

  test('deloads by 2 reps when progressionState is "deload"', () => {
    const result = suggestNextReps({ currentReps: 10, progressionState: 'deload' });
    expect(result.reps).toBe(8);
  });

  test('floors reps at 1 when deloading', () => {
    const result = suggestNextReps({ currentReps: 1, progressionState: 'deload' });
    expect(result.reps).toBe(1);
  });

  test('holds reps unchanged when progressionState is "hold"', () => {
    const result = suggestNextReps({ currentReps: 10, progressionState: 'hold' });
    expect(result.reps).toBe(10);
    expect(result.note).toMatch(/hold/i);
  });

  test('handles negative currentReps gracefully', () => {
    const result = suggestNextReps({ currentReps: -5, progressionState: 'up' });
    expect(result.reps).toBe(0);
  });
});

describe('suggestNextLoad', () => {
  test('returns 0 kg and a note when currentLoadKg is 0 or falsy', () => {
    const result = suggestNextLoad({ currentLoadKg: 0, progressionState: 'up' });
    expect(result.loadKg).toBe(0);
    expect(result.note).toMatch(/conservatively/i);
  });

  test('adds 2.5 kg when progressionState is "up"', () => {
    const result = suggestNextLoad({ currentLoadKg: 100, progressionState: 'up' });
    expect(result.loadKg).toBe(102.5);
  });

  test('caps load at 300 kg when progressing up', () => {
    const result = suggestNextLoad({ currentLoadKg: 299, progressionState: 'up' });
    expect(result.loadKg).toBe(300);
  });

  test('deloads by 5 kg when progressionState is "deload"', () => {
    const result = suggestNextLoad({ currentLoadKg: 100, progressionState: 'deload' });
    expect(result.loadKg).toBe(95);
  });

  test('floors load at 0 when deloading', () => {
    const result = suggestNextLoad({ currentLoadKg: 2, progressionState: 'deload' });
    expect(result.loadKg).toBe(0);
  });

  test('holds load unchanged when progressionState is "hold"', () => {
    const result = suggestNextLoad({ currentLoadKg: 80, progressionState: 'hold' });
    expect(result.loadKg).toBe(80);
    expect(result.note).toMatch(/hold/i);
  });
});
