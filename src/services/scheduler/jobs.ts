import type { Job } from "bullmq";
import type { Bot } from "grammy";
import type { BotContext } from "../../bot/context.js";
import { getPrisma } from "../../db/client.js";
import { getMethod } from "../learning-methods/registry.js";
import { logger } from "../../utils/logger.js";
import type { FlashcardJobData } from "../../types/index.js";

let botInstance: Bot<BotContext> | null = null;

export function setBotInstance(bot: Bot<BotContext>): void {
  botInstance = bot;
}

export function getBotInstance(): Bot<BotContext> | null {
  return botInstance;
}

export async function processFlashcardJob(job: Job<FlashcardJobData>): Promise<void> {
  const { userId, telegramId, sessionId, methodType } = job.data;
  const log = logger.child({ userId, sessionId, jobId: job.id });

  if (!botInstance) {
    log.error("Bot instance not set");
    return;
  }

  const prisma = getPrisma();

  // Check session is still active
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || !session.isActive) {
    log.info("Session no longer active, skipping job");
    return;
  }

  // Get the learning method
  const method = getMethod(methodType);
  if (!method) {
    log.error({ methodType }, "Unknown learning method");
    return;
  }

  // Select a word to send
  const word = await method.selectWord(userId);
  if (!word) {
    log.info("No words available for user");
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await botInstance.api.sendMessage(
          Number(telegramId),
          "🎉 " // Will be replaced with i18n in production
        );
      }
    } catch {
      // ignore
    }
    return;
  }

  // Get user's locale
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const locale = user?.languageCode ?? "uk";

  // Format and send
  const payload = method.formatMessage(word, locale);

  try {
    await botInstance.api.sendMessage(Number(telegramId), payload.text, {
      reply_markup: payload.replyMarkup,
      parse_mode: payload.parseMode,
    });
    log.debug({ wordId: word.id }, "Flashcard sent");
  } catch (err: unknown) {
    const error = err as { description?: string };
    if (
      error.description?.includes("bot was blocked by the user") ||
      error.description?.includes("user is deactivated") ||
      error.description?.includes("chat not found")
    ) {
      log.warn("User blocked bot or chat not found, deactivating session");
      await prisma.learningSession.update({
        where: { id: sessionId },
        data: { isActive: false, stoppedAt: new Date() },
      });
    } else {
      log.error({ err }, "Failed to send flashcard");
      throw err;
    }
  }
}
