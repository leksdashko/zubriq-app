import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getStats } from '../db/progress';
import type { Stats } from '../types';

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    learnedWords: 0,
    dueWords: 0,
    reviewedToday: 0,
  });

  useFocusEffect(
    useCallback(() => {
      setStats(getStats());
    }, []),
  );

  return stats;
}
