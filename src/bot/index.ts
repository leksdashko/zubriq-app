import { Bot, session } from "grammy";
import type { BotContext, SessionData } from "./context.js";
import { createI18n } from "./middlewares/i18n.js";
import { authMiddleware } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/error.js";
import { registerStartHandler } from "./handlers/start.js";
import { registerHelpHandler } from "./handlers/help.js";
import { registerWordsHandlers } from "./handlers/words.js";
import { registerLearnHandlers } from "./handlers/learn.js";
import { registerSettingsHandler } from "./handlers/settings.js";
import { registerStatsHandler } from "./handlers/stats.js";
import { registerCallbackRouter } from "./callbacks/router.js";

export async function createBot(token: string): Promise<Bot<BotContext>> {
  const bot = new Bot<BotContext>(token);

  // Register command menu in Telegram UI
  await bot.api.setMyCommands([
    { command: "start", description: "Почати роботу з ботом" },
    { command: "add", description: "Додати нове слово" },
    { command: "words", description: "Переглянути словник" },
    { command: "learn", description: "Почати вивчення" },
    { command: "stop", description: "Зупинити вивчення" },
    { command: "settings", description: "Налаштування" },
    { command: "stats", description: "Статистика" },
    { command: "import", description: "Імпортувати слова з файлу" },
    { command: "export", description: "Експортувати словник" },
    { command: "help", description: "Довідка" },
  ]);

  // Error handler
  bot.catch(errorHandler);

  // Session middleware
  bot.use(
    session<SessionData, BotContext>({
      initial: (): SessionData => ({}),
    })
  );

  // Auth middleware — must run before i18n so localeNegotiator can access dbUser
  bot.use(authMiddleware);

  // i18n middleware
  const i18n = createI18n();
  bot.use(i18n);

  // Command handlers
  registerStartHandler(bot);
  registerHelpHandler(bot);
  registerLearnHandlers(bot);
  registerSettingsHandler(bot);
  registerStatsHandler(bot);

  // Callback query router (before words handler which catches text)
  registerCallbackRouter(bot);

  // Words handlers (includes text message handler, must be last)
  registerWordsHandlers(bot);

  return bot;
}
