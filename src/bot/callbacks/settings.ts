import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import {
  updateUserLanguage,
  updateTargetLanguage,
} from "../../services/user/index.js";
import {
  languageKeyboard,
  targetLanguageKeyboard,
  settingsKeyboard,
} from "../keyboards/index.js";
import { logger } from "../../utils/logger.js";

export function registerSettingsCallbacks(bot: Composer<BotContext>): void {
  // s:changelang — show language options
  bot.callbackQuery("s:changelang", async (ctx) => {
    try {
      await ctx.editMessageText(ctx.t("start-choose_language"), {
        reply_markup: languageKeyboard(),
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err }, "Error showing language options");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // s:changetarget — show target language options
  bot.callbackQuery("s:changetarget", async (ctx) => {
    try {
      await ctx.editMessageText(ctx.t("start-choose_target"), {
        reply_markup: targetLanguageKeyboard(),
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err }, "Error showing target language options");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // s:lang:{code} — set interface language
  bot.callbackQuery(/^s:lang:(\w+)$/, async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;
    const langCode = ctx.match[1];

    try {
      const user = await updateUserLanguage(authCtx.dbUser.id, langCode);
      authCtx.dbUser = user;
      await ctx.i18n.renegotiateLocale();

      // After language set, ask for target language (onboarding flow)
      await ctx.editMessageText(ctx.t("settings-lang_updated"));
      await ctx.reply(ctx.t("start-choose_target"), {
        reply_markup: targetLanguageKeyboard(),
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err, langCode }, "Error setting language");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // s:target:{code} — set target language
  bot.callbackQuery(/^s:target:(\w+)$/, async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;
    const targetCode = ctx.match[1];

    try {
      const user = await updateTargetLanguage(authCtx.dbUser.id, targetCode);
      authCtx.dbUser = user;

      await ctx.editMessageText(ctx.t("settings-target_updated"));
      await ctx.reply(ctx.t("start-setup_complete"));
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err, targetCode }, "Error setting target language");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });
}
