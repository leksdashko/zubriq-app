import type { WordWithProgress } from '../types';
import { getDueWords, getUnreviewedWords, getHardestWords } from '../db/progress';

export function selectNextWord(): WordWithProgress | null {
  // Priority 1: Words due for review (nextReviewAt <= now)
  const dueWords = getDueWords();
  if (dueWords.length > 0) return dueWords[0];

  // Priority 2: Words with no progress record yet (never reviewed)
  const unreviewed = getUnreviewedWords();
  if (unreviewed.length > 0) return unreviewed[0];

  // Priority 3: Word with lowest ease factor (hardest)
  const hardest = getHardestWords();
  if (hardest.length > 0) return hardest[0];

  return null;
}
