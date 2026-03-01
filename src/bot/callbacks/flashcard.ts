import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { getWordById, deleteWord } from "../../services/dictionary/index.js";
import { getMethod } from "../../services/learning-methods/registry.js";
import { flashcardRevealedKeyboard } from "../keyboards/index.js";
import { logger } from "../../utils/logger.js";

export function registerFlashcardCallbacks(bot: Composer<BotContext>): void {
  // fc:show:{wordId} — reveal translation
  bot.callbackQuery(/^fc:show:(\d+)$/, async (ctx) => {
    const wordId = parseInt(ctx.match[1], 10);

    try {
      const word = await getWordById(wordId);
      if (!word) {
        await ctx.answerCallbackQuery(ctx.t("words-not_found"));
        return;
      }

      const text = ctx.t("flashcard-word_with_translation", {
        word: word.original,
        translation: word.translation,
      });

      await ctx.editMessageText(text, {
        reply_markup: flashcardRevealedKeyboard(wordId),
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err, wordId }, "Error showing translation");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // fc:know:{wordId} — quality 5
  bot.callbackQuery(/^fc:know:(\d+)$/, async (ctx) => {
    const wordId = parseInt(ctx.match[1], 10);

    try {
      const method = getMethod("flashcard");
      if (method) {
        await method.handleResponse(wordId, 5);
      }

      await ctx.answerCallbackQuery("✅");

      // Remove inline keyboard
      try {
        const word = await getWordById(wordId);
        if (word) {
          await ctx.editMessageText(
            `✅ ${word.original} — ${word.translation}`
          );
        }
      } catch {
        // Edit might fail if message is old
      }
    } catch (err) {
      logger.error({ err, wordId }, "Error handling 'know' response");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // fc:hard:{wordId} — quality 2
  bot.callbackQuery(/^fc:hard:(\d+)$/, async (ctx) => {
    const wordId = parseInt(ctx.match[1], 10);

    try {
      const method = getMethod("flashcard");
      if (method) {
        await method.handleResponse(wordId, 2);
      }

      await ctx.answerCallbackQuery("🔄");

      // Show translation after marking as hard
      try {
        const word = await getWordById(wordId);
        if (word) {
          await ctx.editMessageText(
            `🔄 ${word.original} — ${word.translation}`
          );
        }
      } catch {
        // Edit might fail if message is old
      }
    } catch (err) {
      logger.error({ err, wordId }, "Error handling 'hard' response");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // fc:delete:{wordId} — delete word
  bot.callbackQuery(/^fc:delete:(\d+)$/, async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;
    const wordId = parseInt(ctx.match[1], 10);

    try {
      const deleted = await deleteWord(wordId, authCtx.dbUser.id);

      if (deleted) {
        await ctx.editMessageText(ctx.t("words-deleted"));
        await ctx.answerCallbackQuery(ctx.t("words-deleted"));
      } else {
        await ctx.answerCallbackQuery(ctx.t("words-not_found"));
      }
    } catch (err) {
      logger.error({ err, wordId }, "Error deleting word from flashcard");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });
}
