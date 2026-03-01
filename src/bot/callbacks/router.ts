import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import { registerFlashcardCallbacks } from "./flashcard.js";
import { registerWordCallbacks } from "./words.js";
import { registerSettingsCallbacks } from "./settings.js";
import { registerLearnCallbacks } from "./learn.js";

export function registerCallbackRouter(bot: Composer<BotContext>): void {
  registerFlashcardCallbacks(bot);
  registerWordCallbacks(bot);
  registerSettingsCallbacks(bot);
  registerLearnCallbacks(bot);

  // Catch-all for unknown callbacks
  bot.on("callback_query:data", async (ctx) => {
    await ctx.answerCallbackQuery();
  });
}
