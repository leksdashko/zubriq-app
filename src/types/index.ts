import type { InlineKeyboard } from "grammy";
import type { ParseMode } from "grammy/types";

export interface FrequencyOption {
  id: string;
  labelKey: string;
  intervalMs: number | (() => number);
}

export interface MessagePayload {
  text: string;
  replyMarkup: InlineKeyboard;
  parseMode?: ParseMode;
}

export interface FlashcardJobData {
  userId: number;
  telegramId: number;
  sessionId: number;
  methodType: string;
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

export interface ParsedWordLine {
  original: string;
  translation: string;
}
