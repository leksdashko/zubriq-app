import type { WordWithProgress } from '../types';
import { getDueWords, getUnreviewedWords, getHardestWords } from '../db/progress';

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function selectNextWord(): WordWithProgress | null {
  // Priority 1: Words due for review (nextReviewAt <= now)
  const dueWords = getDueWords();
  if (dueWords.length > 0) return pickRandom(dueWords);

  // Priority 2: Words with no progress record yet (never reviewed)
  const unreviewed = getUnreviewedWords();
  if (unreviewed.length > 0) return pickRandom(unreviewed);

  // Priority 3: Word with lowest ease factor (hardest)
  const hardest = getHardestWords();
  if (hardest.length > 0) return pickRandom(hardest);

  return null;
}
