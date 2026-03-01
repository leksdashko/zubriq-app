import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { settingsKeyboard } from "../keyboards/index.js";
import { logger } from "../../utils/logger.js";

export function registerSettingsHandler(bot: Composer<BotContext>): void {
  bot.command("settings", async (ctx) => {
    const authCtx = ctx as AuthContext;

    try {
      const user = authCtx.dbUser;
      const lines = [
        ctx.t("settings-title"),
        "",
        ctx.t("settings-interface_lang", { lang: ctx.t(`languages-${user.languageCode}`) }),
        ctx.t("settings-target_lang", { lang: user.targetLanguage.toUpperCase() }),
        ctx.t("settings-timezone", { tz: user.timezone }),
      ];

      await ctx.reply(lines.join("\n"), {
        reply_markup: settingsKeyboard(),
      });
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /settings handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });
}
