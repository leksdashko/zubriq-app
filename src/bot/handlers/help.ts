import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import { logger } from "../../utils/logger.js";

export function registerHelpHandler(bot: Composer<BotContext>): void {
  bot.command("help", async (ctx) => {
    try {
      const lines = [
        ctx.t("help-title"),
        "",
        ctx.t("help-add"),
        ctx.t("help-words"),
        ctx.t("help-learn"),
        ctx.t("help-stop"),
        ctx.t("help-settings"),
        ctx.t("help-stats"),
        ctx.t("help-import"),
        ctx.t("help-export"),
        ctx.t("help-help"),
      ];
      await ctx.reply(lines.join("\n"));
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /help handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });
}
