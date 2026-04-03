import { useState, useCallback } from 'react';
import { selectNextWord } from '../services/wordSelection';
import { calculateSM2 } from '../services/sm2';
import { upsertProgress } from '../db/progress';
import { deleteWord } from '../db/words';
import { scheduleNextWordNotification } from '../services/notifications';
import type { WordWithProgress } from '../types';

export function useReview() {
  const [currentWord, setCurrentWord] = useState<WordWithProgress | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const loadNext = useCallback(() => {
    const word = selectNextWord();
    setCurrentWord(word);
    setIsFlipped(false);
    setIsComplete(word === null);
  }, []);

  const flip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const answer = useCallback(
    (quality: number) => {
      if (!currentWord) return;

      const result = calculateSM2({
        quality,
        repetitions: currentWord.repetitions ?? 0,
        easeFactor: currentWord.ease_factor ?? 2.5,
        interval: currentWord.interval ?? 0,
      });

      upsertProgress(
        currentWord.id,
        result.easeFactor,
        result.interval,
        result.repetitions,
        result.nextReviewAt,
        result.interval >= 21,
      );

      // Re-schedule notification with updated word selection
      scheduleNextWordNotification();

      loadNext();
    },
    [currentWord, loadNext],
  );

  const removeWord = useCallback(() => {
    if (!currentWord) return;
    deleteWord(currentWord.id);
    scheduleNextWordNotification();
    loadNext();
  }, [currentWord, loadNext]);

  return { currentWord, isFlipped, isComplete, loadNext, flip, answer, removeWord };
}
