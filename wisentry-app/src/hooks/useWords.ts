import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as db from '../db/words';
import type { Word } from '../types';

export function useWords() {
  const [words, setWords] = useState<Word[]>([]);

  const refresh = useCallback(() => {
    setWords(db.getAllWords());
  }, []);

  useFocusEffect(refresh);

  const addWord = useCallback(
    (original: string, translation: string, context?: string) => {
      const word = db.addWord(original, translation, context);
      setWords((prev) => [word, ...prev]);
      return word;
    },
    [],
  );

  const removeWord = useCallback((id: number) => {
    db.deleteWord(id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { words, addWord, removeWord, refresh };
}
