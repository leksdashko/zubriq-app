export interface Word {
  id: number;
  original: string;
  translation: string;
  context: string | null;
  created_at: string; // ISO 8601
}

export interface WordProgress {
  id: number;
  word_id: number;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: string; // ISO 8601
  is_learned: number; // 0 or 1 (SQLite boolean)
  last_review_at: string | null;
}

export interface WordWithProgress extends Word {
  ease_factor: number | null;
  interval: number | null;
  repetitions: number | null;
  next_review_at: string | null;
  is_learned: number | null;
}

export interface SM2Input {
  quality: number;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

export interface Stats {
  totalWords: number;
  learnedWords: number;
  dueWords: number;
  reviewedToday: number;
}
