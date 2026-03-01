import type { Word } from "@prisma/client";
import type { FrequencyOption, MessagePayload } from "../../types/index.js";

export abstract class LearningMethod {
  abstract readonly id: string;
  abstract readonly nameKey: string;
  abstract readonly descriptionKey: string;

  abstract getFrequencyOptions(): FrequencyOption[];
  abstract selectWord(userId: number): Promise<Word | null>;
  abstract formatMessage(word: Word, locale: string): MessagePayload;
  abstract handleResponse(wordId: number, quality: number): Promise<void>;
}
