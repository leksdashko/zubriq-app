import { getDatabase } from './connection';
import type { Word } from '../types';

export function addWord(original: string, translation: string, context?: string): Word {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO words (original, translation, context) VALUES (?, ?, ?)',
    original.trim(),
    translation.trim(),
    context?.trim() || null,
  );
  return db.getFirstSync<Word>('SELECT * FROM words WHERE id = ?', result.lastInsertRowId)!;
}

export function getAllWords(): Word[] {
  const db = getDatabase();
  return db.getAllSync<Word>('SELECT * FROM words ORDER BY created_at DESC');
}

export function deleteWord(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM words WHERE id = ?', id);
}

export function getWordCount(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM words');
  return row?.count ?? 0;
}
