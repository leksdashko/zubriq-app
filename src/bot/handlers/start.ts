import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { languageKeyboard, targetLanguageKeyboard } from "../keyboards/index.js";
import { logger } from "../../utils/logger.js";

export function registerStartHandler(bot: Composer<BotContext>): void {
  bot.command("start", async (ctx) => {
    const authCtx = ctx as AuthContext;
    const name = ctx.from?.first_name ?? "";

    try {
      await ctx.reply(ctx.t("start-welcome", { name }));
      await ctx.reply(ctx.t("start-choose_language"), {
        reply_markup: languageKeyboard(),
      });
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /start handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });
}
