import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { getUserWords, deleteWord } from "../../services/dictionary/index.js";
import { wordListKeyboard } from "../keyboards/index.js";
import { logger } from "../../utils/logger.js";

export function registerWordCallbacks(bot: Composer<BotContext>): void {
  // w:page:{pageNum} — paginate word list
  bot.callbackQuery(/^w:page:(\d+)$/, async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;
    const page = parseInt(ctx.match[1], 10);

    try {
      const { words, total, totalPages } = await getUserWords(
        authCtx.dbUser.id,
        page
      );

      if (total === 0) {
        await ctx.editMessageText(ctx.t("words-empty"));
        await ctx.answerCallbackQuery();
        return;
      }

      const lines = [ctx.t("words-list_header", { count: String(total) }), ""];
      for (const word of words) {
        lines.push(`• ${word.original} — ${word.translation}`);
      }

      await ctx.editMessageText(lines.join("\n"), {
        reply_markup: wordListKeyboard(words, page, totalPages),
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err }, "Error paginating words");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // w:delete:{wordId} — delete word from list
  bot.callbackQuery(/^w:delete:(\d+)$/, async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;
    const wordId = parseInt(ctx.match[1], 10);

    try {
      const deleted = await deleteWord(wordId, authCtx.dbUser.id);

      if (!deleted) {
        await ctx.answerCallbackQuery(ctx.t("words-not_found"));
        return;
      }

      // Refresh the list on page 0
      const { words, total, totalPages } = await getUserWords(
        authCtx.dbUser.id,
        0
      );

      if (total === 0) {
        await ctx.editMessageText(ctx.t("words-empty"));
      } else {
        const lines = [ctx.t("words-list_header", { count: String(total) }), ""];
        for (const word of words) {
          lines.push(`• ${word.original} — ${word.translation}`);
        }
        await ctx.editMessageText(lines.join("\n"), {
          reply_markup: wordListKeyboard(words, 0, totalPages),
        });
      }

      await ctx.answerCallbackQuery(ctx.t("words-deleted"));
    } catch (err) {
      logger.error({ err, wordId }, "Error deleting word from list");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // noop — for page indicator button
  bot.callbackQuery("noop", async (ctx) => {
    await ctx.answerCallbackQuery();
  });
}
