import type { Word } from "@prisma/client";
import { InlineKeyboard } from "grammy";
import { LearningMethod } from "./base.js";
import { getPrisma } from "../../db/client.js";
import { calculateSM2 } from "../spaced-repetition/sm2.js";
import { getFrequencyOptions } from "../scheduler/frequencies.js";
import type { FrequencyOption, MessagePayload } from "../../types/index.js";

export class FlashcardMethod extends LearningMethod {
  readonly id = "flashcard";
  readonly nameKey = "learn-flashcard_name";
  readonly descriptionKey = "learn-flashcard_desc";

  getFrequencyOptions(): FrequencyOption[] {
    return getFrequencyOptions();
  }

  async selectWord(userId: number): Promise<Word | null> {
    const prisma = getPrisma();
    const now = new Date();

    // Priority 1: Words due for review (nextReviewAt <= now)
    const dueProgress = await prisma.wordProgress.findFirst({
      where: {
        word: { userId },
        methodType: this.id,
        nextReviewAt: { lte: now },
        isLearned: false,
      },
      orderBy: { nextReviewAt: "asc" },
      include: { word: true },
    });

    if (dueProgress) return dueProgress.word;

    // Priority 2: Words with no progress record yet (never reviewed)
    const unreviewed = await prisma.word.findFirst({
      where: {
        userId,
        progress: {
          none: { methodType: this.id },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (unreviewed) return unreviewed;

    // Priority 3: Word with lowest ease factor (hardest)
    const hardest = await prisma.wordProgress.findFirst({
      where: {
        word: { userId },
        methodType: this.id,
        isLearned: false,
      },
      orderBy: { easeFactor: "asc" },
      include: { word: true },
    });

    if (hardest) return hardest.word;

    return null;
  }

  formatMessage(word: Word, _locale: string): MessagePayload {
    const text = `📝 «${word.original}»`;

    const replyMarkup = new InlineKeyboard()
      .text("Показати переклад 👀", `fc:show:${word.id}`)
      .row()
      .text("Знаю ✅", `fc:know:${word.id}`)
      .text("Складно 🔄", `fc:hard:${word.id}`);

    return { text, replyMarkup };
  }

  async handleResponse(wordId: number, quality: number): Promise<void> {
    const prisma = getPrisma();

    let progress = await prisma.wordProgress.findUnique({
      where: {
        wordId_methodType: {
          wordId,
          methodType: this.id,
        },
      },
    });

    if (!progress) {
      progress = await prisma.wordProgress.create({
        data: {
          wordId,
          methodType: this.id,
        },
      });
    }

    const result = calculateSM2({
      quality,
      repetitions: progress.repetitions,
      easeFactor: progress.easeFactor,
      interval: progress.interval,
    });

    await prisma.wordProgress.update({
      where: { id: progress.id },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
        lastReviewAt: new Date(),
        isLearned: result.interval >= 21, // Consider learned after 21+ day interval
      },
    });
  }
}
