export const inferProgressionState = ({ lastThreeReps = [], readinessAvg = 3, failedRepMinTwice = false, hitRepMaxAtLowRpeTwice = false }) => {
  if (failedRepMinTwice) return 'deload';
  if (readinessAvg <= 2.5) return 'hold';
  if (hitRepMaxAtLowRpeTwice) return 'up';

  if (lastThreeReps.length >= 3) {
    const [a, b, c] = lastThreeReps;
    const stagnant = Math.abs(c - a) < 2 && b <= c + 2;
    if (stagnant) return 'hold';
  }

  return 'hold';
};

export const suggestNextReps = ({ currentReps, progressionState }) => {
  if (!currentReps || currentReps <= 0) {
    return { reps: 0, note: 'No prior reps. Start conservatively and build.' };
  }

  if (progressionState === 'up') {
    return {
      reps: Math.min(currentReps + 2, 50),
      note: 'Progressing up by 2 reps',
    };
  }

  if (progressionState === 'deload') {
    return {
      reps: Math.max(currentReps - 2, 1),
      note: 'Deloading by 2 reps',
    };
  }

  return {
    reps: currentReps,
    note: 'Hold reps for next session',
  };
};

export const suggestNextLoad = ({ currentLoadKg, progressionState }) => {
  if (!currentLoadKg || currentLoadKg <= 0) {
    return { loadKg: 0, note: 'No prior load. Start conservatively and build.' };
  }

  if (progressionState === 'up') {
    return {
      loadKg: Math.min(currentLoadKg + 2.5, 300),
      note: 'Progressing up by 2.5kg',
    };
  }

  if (progressionState === 'deload') {
    return {
      loadKg: Math.max(currentLoadKg - 5, 0),
      note: 'Deloading by 5kg',
    };
  }

  return {
    loadKg: currentLoadKg,
    note: 'Hold load for next session',
  };
};
