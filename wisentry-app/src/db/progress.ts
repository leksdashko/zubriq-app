import { getDatabase } from './connection';
import type { WordWithProgress, Stats } from '../types';

export function getDueWords(): WordWithProgress[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  return db.getAllSync<WordWithProgress>(
    `SELECT w.*, wp.ease_factor, wp.interval, wp.repetitions, wp.next_review_at, wp.is_learned
     FROM words w
     JOIN word_progress wp ON wp.word_id = w.id
     WHERE wp.next_review_at <= ? AND wp.is_learned = 0
     ORDER BY wp.next_review_at ASC`,
    now,
  );
}

export function getUnreviewedWords(): WordWithProgress[] {
  const db = getDatabase();
  return db.getAllSync<WordWithProgress>(
    `SELECT w.*, NULL as ease_factor, NULL as interval, NULL as repetitions, NULL as next_review_at, NULL as is_learned
     FROM words w
     LEFT JOIN word_progress wp ON wp.word_id = w.id
     WHERE wp.id IS NULL
     ORDER BY w.created_at ASC`,
  );
}

export function getHardestWords(): WordWithProgress[] {
  const db = getDatabase();
  return db.getAllSync<WordWithProgress>(
    `SELECT w.*, wp.ease_factor, wp.interval, wp.repetitions, wp.next_review_at, wp.is_learned
     FROM words w
     JOIN word_progress wp ON wp.word_id = w.id
     WHERE wp.is_learned = 0
     ORDER BY wp.ease_factor ASC`,
  );
}

export function upsertProgress(
  wordId: number,
  easeFactor: number,
  interval: number,
  repetitions: number,
  nextReviewAt: Date,
  isLearned: boolean,
): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO word_progress (word_id, ease_factor, interval, repetitions, next_review_at, is_learned, last_review_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(word_id) DO UPDATE SET
       ease_factor = excluded.ease_factor,
       interval = excluded.interval,
       repetitions = excluded.repetitions,
       next_review_at = excluded.next_review_at,
       is_learned = excluded.is_learned,
       last_review_at = datetime('now')`,
    wordId,
    easeFactor,
    interval,
    repetitions,
    nextReviewAt.toISOString(),
    isLearned ? 1 : 0,
  );
}

export function getStats(): Stats {
  const db = getDatabase();
  const totalWords = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM words')?.count ?? 0;
  const learnedWords = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM word_progress WHERE is_learned = 1')?.count ?? 0;
  const now = new Date().toISOString();
  const dueWords = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM word_progress WHERE next_review_at <= ? AND is_learned = 0`,
    now,
  )?.count ?? 0;
  const unreviewedCount = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM words w LEFT JOIN word_progress wp ON wp.word_id = w.id WHERE wp.id IS NULL`,
  )?.count ?? 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const reviewedToday = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM word_progress WHERE last_review_at >= ?',
    todayStart.toISOString(),
  )?.count ?? 0;

  return { totalWords, learnedWords, dueWords: dueWords + unreviewedCount, reviewedToday };
}
