import type { SM2Input, SM2Result } from '../types';

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, repetitions, easeFactor, interval } = input;

  if (quality < 0 || quality > 5) {
    throw new Error(`Invalid quality rating: ${quality}. Must be 0-5.`);
  }

  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Failed: reset
    newReps = 0;
    newInterval = 0;
  } else {
    // Successful
    newReps = repetitions + 1;

    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEF);
    }
  }

  const nextReviewAt = new Date();
  if (newInterval > 0) {
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
  }

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newReps,
    nextReviewAt,
  };
}
